'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  X, 
  Send, 
  Lock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Headphones, 
  Flame,
  Minus,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ChatMessage, ChatThread } from '@/types';
import { InlineSpinner } from '@/components/LoadingSpinner';

export default function LiveChatWidget() {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  // Fetch messages from server
  const fetchMessages = async (silent = false) => {
    if (!user) return;
    if (!silent) setIsLoading(true);

    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
          setThread(data.thread || null);
          if (isOpen) {
            setUnreadCount(0);
          } else {
            // Count unread admin messages
            const unread = data.messages.filter((m: ChatMessage) => m.sender === 'admin' && !m.read).length;
            setUnreadCount(unread);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load when user signs in or changes
  useEffect(() => {
    if (user) {
      fetchMessages();
    } else {
      setMessages([]);
      setThread(null);
      setUnreadCount(0);
    }
  }, [user]);

  // Polling while chat is open or user is signed in
  useEffect(() => {
    if (!user) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const intervalTime = isOpen ? 3000 : 15000;
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, intervalTime);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user, isOpen]);

  // Auto-scroll when messages update and chat is open
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !user) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic message in UI
    const tempMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      threadId: thread?.id || 'temp',
      sender: 'user',
      senderName: user.name,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    setIsSending(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          // Replace temp message with server message
          setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data.message : m)));
        }
        if (data.thread) setThread(data.thread);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-xl shadow-teal-900/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label={isOpen ? 'Close chat' : 'Open live chat support'}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 transition-transform duration-200 group-hover:rotate-6" />
              {/* Online pulse indicator */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            </>
          )}

          {/* Unread Message Badge */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Live Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 z-40 sm:inset-auto sm:bottom-24 sm:right-6 w-auto sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Window Header */}
          <div className="bg-gradient-to-r from-[#0d9488] to-[#14b8a6] p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                <Headphones className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight block">Vape Well Support</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-white/25 text-white">
                    Live
                  </span>
                </div>
                <span className="text-[11px] text-teal-100 flex items-center gap-1">
                  <span>Fast Australian response</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Section */}
          {!user ? (
            /* LOCKED VIEW: Prompt user to sign in */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/60">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-[#0d9488] flex items-center justify-center shadow-xs">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-base font-black text-slate-900 font-display">
                  Live Chat for Signed-In Users
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To protect customer privacy and provide verified assistance with orders, live support is reserved for registered customers.
                </p>
              </div>

              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Sign In to Chat
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 transition-colors cursor-pointer"
                >
                  Create New Account
                </button>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />
                <span>100% Free • Takes 20 seconds</span>
              </div>
            </div>
          ) : (
            /* CHAT VIEW: Active authenticated message stream */
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
              {/* Messages feed */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {isLoading && messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
                    <InlineSpinner className="w-5 h-5 text-[#0d9488]" />
                    <span>Connecting to live support...</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === 'user';
                    const isSystem = msg.sender === 'system';
                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('en-AU', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-3">
                          <div className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] leading-relaxed border border-slate-200">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                            {msg.senderName || 'Vape Well Support'}
                          </span>
                        )}

                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#0d9488] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{timeStr}</span>
                          {isMe && (
                            <CheckCheck
                              className={`w-3 h-3 ${msg.read ? 'text-[#0d9488]' : 'text-slate-300'}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-10 h-10 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 flex-shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <InlineSpinner className="w-4 h-4 text-white" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

