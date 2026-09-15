-- Live Chat and Customer Auth Tables for Vape Well Australia
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New query -> Run

-- 1. CHAT THREADS TABLE
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_by_admin_count INTEGER DEFAULT 0,
  unread_by_user_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMER USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ultra-fast chat thread and message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON public.chat_messages (thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_email ON public.chat_threads (user_email);
CREATE INDEX IF NOT EXISTS idx_chat_threads_updated ON public.chat_threads (last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public and service role access
DROP POLICY IF EXISTS "Allow all operations on chat_threads" ON public.chat_threads;
CREATE POLICY "Allow all operations on chat_threads" ON public.chat_threads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on chat_messages" ON public.chat_messages;
CREATE POLICY "Allow all operations on chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
