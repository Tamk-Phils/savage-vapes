import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ChatMessage, ChatThread, User } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface StoredChatData {
  threads: ChatThread[];
  messages: ChatMessage[];
}

const STORAGE_BUCKET = 'app-data';
const STORAGE_FILE = 'chats.json';

// In-memory cache for ultra-fast local operations
let memoryChatData: StoredChatData | null = null;

function getLocalChatFilePath(): string {
  const tmpPath = path.join('/tmp', 'chats.json');
  const localPath = path.join(process.cwd(), 'data', 'chats.json');
  return fs.existsSync(tmpPath) ? tmpPath : localPath;
}

function readLocalChatData(): StoredChatData {
  try {
    const filePath = getLocalChatFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local chat data:', err);
  }
  return { threads: [], messages: [] };
}

function writeLocalChatData(data: StoredChatData): void {
  memoryChatData = data;
  const localPath = path.join(process.cwd(), 'data', 'chats.json');
  const tmpPath = path.join('/tmp', 'chats.json');

  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving chat data to fallback /tmp:', err);
    }
  }
}

async function loadChatData(): Promise<StoredChatData> {
  // 1. Try Supabase Storage with anti-cache busting
  if (isSupabaseConfigured() && supabase) {
    try {
      const cacheBustKey = `${STORAGE_FILE}?t=${Date.now()}`;
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(cacheBustKey);
      if (data && !error) {
        const text = await data.text();
        const parsed: StoredChatData = JSON.parse(text);
        if (Array.isArray(parsed.threads) && Array.isArray(parsed.messages)) {
          writeLocalChatData(parsed);
          return parsed;
        }
      }
    } catch (err) {
      // Fall through to memory or local cache
    }
  }

  // 2. Memory cache if available
  if (memoryChatData) {
    return memoryChatData;
  }

  // 3. Local disk cache
  return readLocalChatData();
}

async function saveChatData(data: StoredChatData): Promise<void> {
  writeLocalChatData(data);

  // Sync to Supabase Storage with cacheControl: '0' to prevent CDN caching
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).upload(
        STORAGE_FILE,
        Buffer.from(JSON.stringify(data, null, 2)),
        {
          upsert: true,
          cacheControl: '0',
          contentType: 'application/json',
        }
      );
    } catch (err) {
      console.error('Error uploading chat data to Supabase Storage:', err);
    }
  }
}

// -------------------------------------------------------------
// POSTGRESQL TABLE HELPERS (Used when chat_threads table exists)
// -------------------------------------------------------------

function mapDbThread(row: any): ChatThread {
  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name || '',
    userEmail: row.user_email || '',
    userPhone: row.user_phone || undefined,
    lastMessage: row.last_message || '',
    lastMessageAt: row.last_message_at ? new Date(row.last_message_at).toISOString() : new Date().toISOString(),
    unreadByAdminCount: row.unread_by_admin_count || 0,
    unreadByUserCount: row.unread_by_user_count || 0,
    status: row.status || 'active',
  };
}

function mapDbMessage(row: any): ChatMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    sender: row.sender,
    senderName: row.sender_name,
    text: row.text,
    read: row.read ?? false,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// PUBLIC CHAT METHODS
// -------------------------------------------------------------

export async function getOrCreateThread(user: User): Promise<ChatThread> {
  const normalizedEmail = user.email.toLowerCase().trim();

  // 1. Try PostgreSQL table if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbThread, error } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('user_email', normalizedEmail)
        .maybeSingle();

      if (!error) {
        if (dbThread) {
          return mapDbThread(dbThread);
        }

        // Thread doesn't exist, create it in Postgres
        const threadId = 'th_' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();
        const newThreadRow = {
          id: threadId,
          user_id: user.id,
          user_name: user.name,
          user_email: normalizedEmail,
          user_phone: user.phone || null,
          last_message: 'Chat started',
          last_message_at: now,
          unread_by_admin_count: 0,
          unread_by_user_count: 0,
          status: 'active',
        };

        const { error: insErr } = await supabase.from('chat_threads').insert(newThreadRow);
        if (!insErr) {
          // Welcome message
          const welcomeMsg = {
            id: 'msg_' + crypto.randomBytes(8).toString('hex'),
            thread_id: threadId,
            sender: 'system',
            sender_name: 'Vape Well Assistant',
            text: `Hello ${user.name.split(' ')[0]}! Welcome to Vape Well Australia live support. How can we help you with your order, device questions, or shipping today?`,
            read: true,
            created_at: now,
          };
          await supabase.from('chat_messages').insert(welcomeMsg);
          return mapDbThread(newThreadRow);
        }
      }
    } catch (e) {
      // Fallback to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  let thread = data.threads.find(
    (t) => t.userId === user.id || t.userEmail.toLowerCase() === normalizedEmail
  );

  if (!thread) {
    const threadId = 'th_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    thread = {
      id: threadId,
      userId: user.id,
      userName: user.name,
      userEmail: normalizedEmail,
      userPhone: user.phone,
      lastMessage: 'Chat started',
      lastMessageAt: now,
      unreadByAdminCount: 0,
      unreadByUserCount: 0,
      status: 'active',
    };
    data.threads.unshift(thread);

    const welcomeMsg: ChatMessage = {
      id: 'msg_' + crypto.randomBytes(8).toString('hex'),
      threadId,
      sender: 'system',
      senderName: 'Vape Well Assistant',
      text: `Hello ${user.name.split(' ')[0]}! Welcome to Vape Well Australia live support. How can we help you with your order, device questions, or shipping today?`,
      createdAt: now,
      read: true,
    };
    data.messages.push(welcomeMsg);

    await saveChatData(data);
  }

  return thread;
}

export async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(dbMessages)) {
        return dbMessages.map(mapDbMessage);
      }
    } catch (e) {
      // Fallback to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  return data.messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function sendUserMessage(
  user: User,
  text: string
): Promise<{ success: boolean; message: ChatMessage; thread: ChatThread }> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Message cannot be empty');
  }

  const thread = await getOrCreateThread(user);
  const msgId = 'msg_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbMsgRow = {
        id: msgId,
        thread_id: thread.id,
        sender: 'user',
        sender_name: user.name,
        text: cleanText,
        read: false,
        created_at: now,
      };

      const { error: insErr } = await supabase.from('chat_messages').insert(dbMsgRow);
      if (!insErr) {
        // Update thread in Postgres
        await supabase
          .from('chat_threads')
          .update({
            last_message: cleanText,
            last_message_at: now,
            unread_by_admin_count: (thread.unreadByAdminCount || 0) + 1,
            status: 'active',
          })
          .eq('id', thread.id);

        const updatedThread: ChatThread = {
          ...thread,
          lastMessage: cleanText,
          lastMessageAt: now,
          unreadByAdminCount: (thread.unreadByAdminCount || 0) + 1,
          status: 'active',
        };

        return {
          success: true,
          message: mapDbMessage(dbMsgRow),
          thread: updatedThread,
        };
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  const newMsg: ChatMessage = {
    id: msgId,
    threadId: thread.id,
    sender: 'user',
    senderName: user.name,
    text: cleanText,
    createdAt: now,
    read: false,
  };

  data.messages.push(newMsg);

  const threadIdx = data.threads.findIndex((t) => t.id === thread.id);
  if (threadIdx > -1) {
    data.threads[threadIdx].lastMessage = cleanText;
    data.threads[threadIdx].lastMessageAt = now;
    data.threads[threadIdx].unreadByAdminCount = (data.threads[threadIdx].unreadByAdminCount || 0) + 1;
    data.threads[threadIdx].status = 'active';
  }

  await saveChatData(data);

  return {
    success: true,
    message: newMsg,
    thread: data.threads[threadIdx] || thread,
  };
}

export async function sendAdminReply(
  threadId: string,
  text: string,
  adminName = 'Vape Well Support'
): Promise<{ success: boolean; message: ChatMessage }> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Reply cannot be empty');
  }

  const msgId = 'msg_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbMsgRow = {
        id: msgId,
        thread_id: threadId,
        sender: 'admin',
        sender_name: adminName,
        text: cleanText,
        read: false,
        created_at: now,
      };

      const { error: insErr } = await supabase.from('chat_messages').insert(dbMsgRow);
      if (!insErr) {
        // Update thread stats in Postgres
        await supabase
          .from('chat_threads')
          .update({
            last_message: cleanText,
            last_message_at: now,
            unread_by_admin_count: 0,
            unread_by_user_count: 1,
          })
          .eq('id', threadId);

        return { success: true, message: mapDbMessage(dbMsgRow) };
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  const threadIdx = data.threads.findIndex((t) => t.id === threadId);
  if (threadIdx === -1) {
    throw new Error('Chat thread not found');
  }

  const replyMsg: ChatMessage = {
    id: msgId,
    threadId,
    sender: 'admin',
    senderName: adminName,
    text: cleanText,
    createdAt: now,
    read: false,
  };

  data.messages.push(replyMsg);
  data.threads[threadIdx].lastMessage = cleanText;
  data.threads[threadIdx].lastMessageAt = now;
  data.threads[threadIdx].unreadByUserCount = (data.threads[threadIdx].unreadByUserCount || 0) + 1;
  data.threads[threadIdx].unreadByAdminCount = 0;

  await saveChatData(data);

  return { success: true, message: replyMsg };
}

export async function getAllThreads(): Promise<ChatThread[]> {
  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbThreads, error } = await supabase
        .from('chat_threads')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (!error && Array.isArray(dbThreads)) {
        return dbThreads.map(mapDbThread);
      }
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  return data.threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function markThreadRead(threadId: string, by: 'admin' | 'user'): Promise<void> {
  // 1. Try PostgreSQL table
  if (isSupabaseConfigured() && supabase) {
    try {
      const updateData = by === 'admin'
        ? { unread_by_admin_count: 0 }
        : { unread_by_user_count: 0 };

      await supabase.from('chat_threads').update(updateData).eq('id', threadId);

      const targetSender = by === 'admin' ? 'user' : 'admin';
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('thread_id', threadId)
        .eq('sender', targetSender);
    } catch (e) {
      // Fall through to storage
    }
  }

  // 2. Storage / Local Fallback
  const data = await loadChatData();
  const threadIdx = data.threads.findIndex((t) => t.id === threadId);
  if (threadIdx > -1) {
    if (by === 'admin') {
      data.threads[threadIdx].unreadByAdminCount = 0;
    } else {
      data.threads[threadIdx].unreadByUserCount = 0;
    }
  }

  data.messages.forEach((m) => {
    if (m.threadId === threadId) {
      if (by === 'admin' && m.sender === 'user') m.read = true;
      if (by === 'user' && m.sender === 'admin') m.read = true;
    }
  });

  await saveChatData(data);
}
