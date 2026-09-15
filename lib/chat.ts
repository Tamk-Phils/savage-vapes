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
  // 1. Try Supabase Storage first for shared multi-container persistence
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(STORAGE_FILE);
      if (data && !error) {
        const text = await data.text();
        const parsed: StoredChatData = JSON.parse(text);
        if (Array.isArray(parsed.threads) && Array.isArray(parsed.messages)) {
          writeLocalChatData(parsed); // Sync to local cache
          return parsed;
        }
      }
    } catch (err) {
      // Fall through to local cache
    }
  }

  // 2. Fallback to local cache
  return readLocalChatData();
}

async function saveChatData(data: StoredChatData): Promise<void> {
  // Always update local disk cache immediately
  writeLocalChatData(data);

  // Sync to Supabase Storage so all serverless lambdas share the exact same state
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.storage.from(STORAGE_BUCKET).upload(STORAGE_FILE, Buffer.from(JSON.stringify(data, null, 2)), {
        upsert: true,
        contentType: 'application/json',
      });
    } catch (err) {
      console.error('Error uploading chat data to Supabase Storage:', err);
    }
  }
}

export async function getOrCreateThread(user: User): Promise<ChatThread> {
  const data = await loadChatData();
  let thread = data.threads.find(
    (t) => t.userId === user.id || t.userEmail.toLowerCase() === user.email.toLowerCase()
  );

  if (!thread) {
    const threadId = 'th_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    thread = {
      id: threadId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      lastMessage: 'Chat started',
      lastMessageAt: now,
      unreadByAdminCount: 0,
      unreadByUserCount: 0,
      status: 'active',
    };
    data.threads.unshift(thread);

    // Initial system greeting message
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
  const data = await loadChatData();

  const msgId = 'msg_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

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

  // Update thread stats
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

  const data = await loadChatData();
  const threadIdx = data.threads.findIndex((t) => t.id === threadId);
  if (threadIdx === -1) {
    throw new Error('Chat thread not found');
  }

  const msgId = 'msg_' + crypto.randomBytes(8).toString('hex');
  const now = new Date().toISOString();

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
  data.threads[threadIdx].unreadByAdminCount = 0; // Admin replied

  await saveChatData(data);

  return { success: true, message: replyMsg };
}

export async function getAllThreads(): Promise<ChatThread[]> {
  const data = await loadChatData();
  return data.threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function markThreadRead(threadId: string, by: 'admin' | 'user'): Promise<void> {
  const data = await loadChatData();
  const threadIdx = data.threads.findIndex((t) => t.id === threadId);
  if (threadIdx > -1) {
    if (by === 'admin') {
      data.threads[threadIdx].unreadByAdminCount = 0;
    } else {
      data.threads[threadIdx].unreadByUserCount = 0;
    }
  }

  // Mark all messages for this thread as read
  data.messages.forEach((m) => {
    if (m.threadId === threadId) {
      if (by === 'admin' && m.sender === 'user') m.read = true;
      if (by === 'user' && m.sender === 'admin') m.read = true;
    }
  });

  await saveChatData(data);
}
