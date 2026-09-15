'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree, 
  Settings, 
  Store, 
  Lock, 
  LogOut, 
  Flame,
  Menu,
  X,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const localAuth = localStorage.getItem('vapewell_admin_auth') || localStorage.getItem('savage_admin_auth');
      const sessionAuth = sessionStorage.getItem('vapewell_admin_auth') || sessionStorage.getItem('savage_admin_auth');
      if (localAuth === 'true' || sessionAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();
    // Accept: vapewell2026, vapewell, admin123, admin, savage2026, savage
    if (clean === 'vapewell2026' || clean === 'vapewell' || clean === 'admin123' || clean === 'admin' || clean === 'savage2026' || clean === 'savage') {
      try {
        localStorage.setItem('vapewell_admin_auth', 'true');
        sessionStorage.setItem('vapewell_admin_auth', 'true');
      } catch (e) {}
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('vapewell_admin_auth');
      sessionStorage.removeItem('vapewell_admin_auth');
      localStorage.removeItem('savage_admin_auth');
      sessionStorage.removeItem('savage_admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setPasscode('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full p-5 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Vape Well Admin Portal
            </h1>
            <p className="text-xs text-gray-500">
              Enter administrator passcode to access store inventory, orders, and settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter administrator passcode"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-2 focus:ring-[#45cab4]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#45cab4] hover:bg-[#38b29e] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Return to Vape Well Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Live Chat (Support)', href: '/admin/chats', icon: MessageSquare },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Products (2,172)', href: '/admin/products', icon: Package },
    { label: 'Blog Posts (25)', href: '/admin/posts', icon: BookOpen },
    { label: 'Categories (89)', href: '/admin/categories', icon: FolderTree },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 flex flex-col md:flex-row overflow-x-clip">
      {/* Mobile Sticky Top Bar */}
      <div className="sticky top-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-[#45cab4]" />
          <span className="font-black text-gray-900 text-sm tracking-tight">VAPE WELL ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between p-5 transition-transform duration-200 shadow-xl md:shadow-none md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#45cab4] flex items-center justify-center shadow-sm">
              <Flame className="w-5 h-5 text-black fill-current" />
            </div>
            <div>
              <span className="text-base font-black tracking-wide text-gray-900 block">
                VAPE<span className="text-[#45cab4]">WELL</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">
                ● Live Admin
              </span>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#45cab4]/15 text-[#2b9685] border border-[#45cab4]/30 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-6 border-t border-gray-200">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Store className="w-4 h-4 text-[#45cab4]" />
            <span>View Public Store ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 w-full overflow-x-clip p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
