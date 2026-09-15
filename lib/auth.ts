import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

const STORAGE_BUCKET = 'app-data';
const STORAGE_FILE = 'users.json';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'vapewell-australia-auth-secret-key-2026';

function getLocalUsersFilePath(): string {
  const tmpPath = path.join('/tmp', 'users.json');
  const localPath = path.join(process.cwd(), 'data', 'users.json');
  return fs.existsSync(tmpPath) ? tmpPath : localPath;
}

function readLocalUsers(): StoredUser[] {
  try {
    const filePath = getLocalUsersFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local users:', err);
  }
  return [];
}

function writeLocalUsers(users: StoredUser[]): void {
  const localPath = path.join(process.cwd(), 'data', 'users.json');
  const tmpPath = path.join('/tmp', 'users.json');

  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving users to fallback /tmp:', err);
    }
  }
}

async function loadUsers(): Promise<StoredUser[]> {
  // 1. Try Supabase Storage with anti-cache query
  if (isSupabaseConfigured() && supabase) {
    try {
      const cacheBustKey = `${STORAGE_FILE}?t=${Date.now()}`;
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(cacheBustKey);
      if (data && !error) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          writeLocalUsers(parsed);
          return parsed;
        }
      }
    } catch (err) {
      // Fall through to local cache
    }
  }

  // 2. Fallback to local cache
  return readLocalUsers();
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  writeLocalUsers(users);

  // Sync to Supabase Storage with cacheControl: '0'
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).upload(
        STORAGE_FILE,
        Buffer.from(JSON.stringify(users, null, 2)),
        {
          upsert: true,
          cacheControl: '0',
          contentType: 'application/json',
        }
      );
    } catch (err) {
      console.error('Error uploading users to Supabase Storage:', err);
    }
  }
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: verifyHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

export function createSessionToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

export function verifySessionToken(token: string): User | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [b64Payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(b64Payload).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'customer',
      createdAt: '',
    };
  } catch (err) {
    return null;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !normalizedEmail || !password) {
    return { success: false, error: 'Name, email, and password are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const { hash, salt } = hashPassword(password);
  const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  const newUser: User = {
    id: userId,
    name: cleanName,
    email: normalizedEmail,
    phone: phone?.trim() || undefined,
    role: 'customer',
    createdAt: now,
  };

  // 1. Try PostgreSQL table if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: existingDb } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingDb) {
        return { success: false, error: 'An account with this email address already exists.' };
      }

      const { error: insErr } = await supabase.from('users').insert({
        id: userId,
        name: cleanName,
        email: normalizedEmail,
        phone: phone?.trim() || null,
        role: 'customer',
        password_hash: hash,
        salt,
        created_at: now,
      });

      if (!insErr) {
        const token = createSessionToken(newUser);
        return { success: true, user: newUser, token };
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const users = await loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const storedUser: StoredUser = {
    ...newUser,
    passwordHash: hash,
    salt,
  };

  users.push(storedUser);
  await saveUsers(users);

  const token = createSessionToken(newUser);
  return { success: true, user: newUser, token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 1. Try PostgreSQL table if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && dbUser) {
        const isValid = verifyPassword(password, dbUser.password_hash, dbUser.salt);
        if (!isValid) {
          return { success: false, error: 'Invalid email or password.' };
        }

        const user: User = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone || undefined,
          role: dbUser.role || 'customer',
          createdAt: dbUser.created_at,
        };

        const token = createSessionToken(user);
        return { success: true, user, token };
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const users = await loadUsers();
  const stored = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!stored) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isValid = verifyPassword(password, stored.passwordHash, stored.salt);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const user: User = {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    phone: stored.phone,
    role: stored.role,
    createdAt: stored.createdAt,
  };

  const token = createSessionToken(user);
  return { success: true, user, token };
}

export async function getUserById(id: string): Promise<User | null> {
  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone || undefined,
          role: dbUser.role || 'customer',
          createdAt: dbUser.created_at,
        };
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const users = await loadUsers();
  const stored = users.find((u) => u.id === id);
  if (!stored) return null;

  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    phone: stored.phone,
    role: stored.role,
    createdAt: stored.createdAt,
  };
}
