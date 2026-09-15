import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'vapewell-australia-auth-secret-key-2026';

function getUsersFilePath(): string {
  const tmpPath = path.join('/tmp', 'users.json');
  const localPath = path.join(process.cwd(), 'data', 'users.json');
  return fs.existsSync(tmpPath) ? tmpPath : localPath;
}

function loadUsers(): StoredUser[] {
  try {
    const filePath = getUsersFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]): void {
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

  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const { hash, salt } = hashPassword(password);
  const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
  const newUser: User = {
    id: userId,
    name: cleanName,
    email: normalizedEmail,
    phone: phone?.trim() || undefined,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  const storedUser: StoredUser = {
    ...newUser,
    passwordHash: hash,
    salt,
  };

  users.push(storedUser);
  saveUsers(users);

  // Sync to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('users').upsert({
        id: userId,
        name: cleanName,
        email: normalizedEmail,
        phone: phone?.trim() || null,
        role: 'customer',
      });
    } catch (e) {
      console.warn('Supabase user sync error:', e);
    }
  }

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

  const users = loadUsers();
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
  const users = loadUsers();
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
