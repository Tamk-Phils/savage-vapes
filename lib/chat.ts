import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ChatMessage, ChatThread, User } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

interface StoredChatData {
  threads: ChatThread[];
  messages: ChatMessage[];
}

function getChatFilePath(): string {
  const tmpPath = path.join('/tmp', 'chats.json');
  const localPath = path.join(process.cwd(), 'data', 'chats.json');
  return fs.existsSync(tmpPath) ? tmpPath : localPath;
}

function loadChatData(): StoredChatData {
  try {
    const filePath = getChatFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading chat data:', err);
  }
  return { threads: [], messages: [] };
}

function saveChatData(data: StoredChatData): void {
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

export async function getOrCreateThread(user: User): Promise<ChatThread> {
  const data = loadChatData();
  let thread = data.threads.find((t) => t.userId === user.id || t.userEmail.toLowerCase() === user.email.toLowerCase());

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

    saveChatData(data);

    // Attempt Supabase insert
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('chat_threads').upsert(thread);
        await supabase.from('chat_messages').insert(welcomeMsg);
      } catch (e) {
        // Ignored
      }
    }
  }

  return thread;
}

export async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
  const data = loadChatData();
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
  const data = loadChatData();

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

  saveChatData(data);

  // Sync to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('chat_messages').insert(newMsg);
      if (threadIdx > -1) {
        await supabase.from('chat_threads').upsert(data.threads[threadIdx]);
      }
    } catch (e) {
      // Graceful fallback
    }
  }

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

  const data = loadChatData();
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

  saveChatData(data);

  // Sync to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('chat_messages').insert(replyMsg);
      await supabase.from('chat_threads').upsert(data.threads[threadIdx]);
    } catch (e) {
      // Graceful fallback
    }
  }

  return { success: true, message: replyMsg };
}

export async function getAllThreads(): Promise<ChatThread[]> {
  const data = loadChatData();
  return data.threads.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function markThreadRead(threadId: string, by: 'admin' | 'user'): Promise<void> {
  const data = loadChatData();
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

  saveChatData(data);
}
