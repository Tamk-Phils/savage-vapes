'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCheck,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, ChatThread } from '@/types';
import LoadingSpinner, { InlineSpinner } from '@/components/LoadingSpinner';

export default function AdminChatsPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch threads
  const fetchThreads = async (silent = false) => {
    if (!silent) setLoadingThreads(true);
    try {
      const res = await fetch('/api/admin/chats');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
        // Auto-select first thread if none selected
        if (!selectedThreadId && data.threads && data.threads.length > 0) {
          setSelectedThreadId(data.threads[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching admin threads:', err);
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  };

  // Fetch messages for selected thread
  const fetchMessages = async (threadId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/chats?threadId=${encodeURIComponent(threadId)}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Also update local thread unread count
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, unreadByAdminCount: 0 } : t))
        );
      }
    } catch (err) {
      console.error('Error fetching thread messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Check if ?thread=... is in query string
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlThreadId = params.get('thread');
      if (urlThreadId) {
        setSelectedThreadId(urlThreadId);
      }
    }
    fetchThreads();
  }, []);

  // When selected thread changes
  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId]);

  // Polling every 4 seconds
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      fetchThreads(true);
      if (selectedThreadId) {
        fetchMessages(selectedThreadId, true);
      }
    }, 4000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [selectedThreadId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedThreadId || isSending) return;

    const text = replyText.trim();
    setReplyText('');

    const tempMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      threadId: selectedThreadId,
      sender: 'admin',
      senderName: 'Vape Well Support',
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThreadId,
          text,
          adminName: 'Vape Well Support',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
        }
        fetchThreads(true);
      }
    } catch (err) {
      console.error('Error sending admin reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterTab === 'all' || (t.unreadByAdminCount || 0) > 0;
    return matchesSearch && matchesFilter;
  });

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadByAdminCount || 0), 0);

  const cannedResponses = [
    'Hello! How can I assist you with your order today?',
    'All products are 100% authentic with scratch-off verification seals.',
    'Express Australia Post dispatch takes 1-2 business days to major cities.',
    'Our minimum order requirement is 5 products total across any flavors.',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#0d9488]" />
            Live Chat & Support Inbox
            {totalUnread > 0 && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm">
                {totalUnread} new
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time conversations with signed-in customers. Instant email alerts are dispatched via SpaceMail SMTP.
          </p>
        </div>

        <button
          onClick={() => {
            fetchThreads();
            if (selectedThreadId) fetchMessages(selectedThreadId);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px]">
        {/* Left Column: Threads Sidebar */}
        <div className="lg:col-span-4 border-r border-gray-200 flex flex-col bg-slate-50/40">
          {/* Search & Tabs */}
          <div className="p-3.5 border-b border-gray-200 space-y-2.5 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers or messages..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Chats ({threads.length})
              </button>
              <button
                onClick={() => setFilterTab('unread')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterTab === 'unread'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Unread</span>
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                    {totalUnread}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loadingThreads ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <InlineSpinner className="w-5 h-5 text-[#0d9488]" />
                <p>Loading conversations...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No conversations found</p>
                <p className="text-[11px]">When customers chat, threads will appear here.</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === selectedThreadId;
                const timeAgo = new Date(t.lastMessageAt).toLocaleDateString('en-AU', {
                  month: 'short',
                  day: 'numeric',
                });
                const hasUnread = (t.unreadByAdminCount || 0) > 0;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-l-4 border-l-[#0d9488]'
                        : hasUnread
                        ? 'bg-amber-50/40 hover:bg-slate-100'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {t.userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate ${hasUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {t.userName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo}</span>
                      </div>

                      <p className={`text-xs truncate leading-snug ${hasUnread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                        {t.lastMessage}
                      </p>

                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {t.userEmail}
                      </span>
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {selectedThread ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedThread.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{selectedThread.userName}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        Signed In Customer
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <a href={`mailto:${selectedThread.userEmail}`} className="hover:text-[#0d9488]">
                          {selectedThread.userEmail}
                        </a>
                      </span>
                      {selectedThread.userPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a href={`tel:${selectedThread.userPhone}`} className="hover:text-[#0d9488]">
                            {selectedThread.userPhone}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Thread ID</span>
                  <code className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {selectedThread.id}
                  </code>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    <InlineSpinner className="w-5 h-5 text-[#0d9488]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No messages in this thread yet.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.sender === 'admin';
                    const isSystem = msg.sender === 'system';
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('en-AU', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[11px]">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                          {isStaff ? 'Store Support' : selectedThread.userName}
                        </span>

                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isStaff
                              ? 'bg-[#0d9488] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{timeStr}</span>
                          {isStaff && (
                            <CheckCheck
                              className={`w-3 h-3 ${msg.read ? 'text-[#0d9488]' : 'text-slate-300'}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses */}
              <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <Sparkles className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
                  Quick Reply:
                </span>
                {cannedResponses.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(qr)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-[#0d9488] text-[11px] text-slate-600 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {qr.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-3.5 bg-white border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selectedThread.userName.split(' ')[0]} as Vape Well Support...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSending ? (
                    <InlineSpinner className="w-4 h-4 text-white" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <h3 className="text-sm font-bold text-slate-700">No Conversation Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Select a customer conversation from the list to view the full chat history and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
