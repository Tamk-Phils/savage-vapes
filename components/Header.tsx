'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  Flame, 
  Truck, 
  ShieldCheck, 
  ShieldAlert,
  UserCheck,
  User as UserIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Product } from '@/types';
import { InlineSpinner } from '@/components/LoadingSpinner';

export default function Header() {
  const router = useRouter();
  const { itemCount, subtotal, openCart } = useCart();
  const { user, openAuthModal, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white text-[#3a3a3a] border-b border-gray-200 shadow-sm transition-all">
      {/* Top Announcement Bar - Clean Light Theme */}
      <div className="w-full bg-[#f0fdfa] text-[11px] sm:text-xs text-teal-950 py-2 px-4 border-b border-teal-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 text-[#0d9488] font-bold tracking-wide">
              <Truck className="w-3.5 h-3.5" />
              <span>EXPRESS DISPATCH AUSTRALIA-WIDE</span>
            </span>
            <span className="hidden sm:inline text-teal-800/80 font-normal">| Same-day dispatch before 2:00 PM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-teal-800/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />
              <span>100% Authentic Guaranteed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Primary Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Site Title / Branding matching Astra theme */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#45cab4] flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold font-display text-[#222222] tracking-tight group-hover:text-[#45cab4] transition-colors">
                Vape Well Australia
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider -mt-1 hidden sm:block">
                Authentic Vapes & Pods
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search products..."
                className="w-full bg-[#f7f7f7] text-xs text-[#3a3a3a] placeholder-gray-400 rounded-full pl-10 pr-10 py-2.5 border border-gray-200 focus:border-[#45cab4] focus:bg-white focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {isSearching && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <InlineSpinner className="w-4 h-4 text-[#0d9488]" />
                </span>
              )}
            </form>

            {/* Live Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 divide-y divide-gray-100">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
                    >
                      <div className="w-11 h-11 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                        <img
                          src={product.images[0]?.src || '/placeholder-vape.jpg'}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#45cab4] uppercase tracking-wider">
                          {product.brand}
                        </span>
                        <h4 className="text-xs font-semibold text-[#3a3a3a] truncate group-hover:text-[#45cab4] transition-colors">
                          {product.name}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-[#222222]">
                        ${product.price.toFixed(2)}
                      </span>
                    </Link>
                  ))}
                  <div className="p-2 text-center bg-gray-50">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-[#45cab4] hover:underline"
                    >
                      View all matching products →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links matching Astra */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-[#3a3a3a]">
            <Link href="/" className="hover:text-[#45cab4] transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-[#45cab4] transition-colors">
              Shop
            </Link>
            <Link href="/blog" className="hover:text-[#45cab4] transition-colors">
              Vape Guides
            </Link>
            <Link href="/checkout" className="hover:text-[#45cab4] transition-colors">
              Checkout
            </Link>
            <Link href="/about" className="hover:text-[#45cab4] transition-colors">
              About
            </Link>
            <Link href="/reviews" className="hover:text-[#45cab4] transition-colors">
              Reviews
            </Link>
          </nav>

          {/* Right Action: Pill Button + Cart */}
          <div className="flex items-center gap-3">
            {/* Custom Pill Button matching reference theme (.ast-custom-button) */}
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#45cab4] hover:bg-[#3a3a3a] hover:text-white text-black text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
            >
              Shop Now
            </Link>

            {/* Customer Account Button */}
            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#3a3a3a] text-xs font-bold transition-colors cursor-pointer"
                  aria-label="Account menu"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0d9488] text-white flex items-center justify-center text-[10px] font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[85px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#3a3a3a] text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 rounded-xl mb-1">
                    <span className="font-bold text-slate-900 block truncate">{user.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#3a3a3a] transition-colors"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#45cab4] text-black text-[11px] font-black flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 text-[#3a3a3a]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#f7f7f7] text-xs text-[#3a3a3a] placeholder-gray-400 rounded-full pl-9 pr-4 py-2 border border-gray-200 focus:border-[#45cab4] focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2 text-sm font-medium text-[#3a3a3a]">
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-2 border-b border-gray-100 mb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-full bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                Sign In / Register
              </button>
            </div>
          )}

          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-gray-100 hover:text-[#45cab4]">
            Home
          </Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-gray-100 hover:text-[#45cab4]">
            Shop
          </Link>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-gray-100 hover:text-[#45cab4]">
            Vape Guides & Blog
          </Link>
          <Link href="/checkout" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-gray-100 hover:text-[#45cab4]">
            Checkout
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-gray-100 hover:text-[#45cab4]">
            About
          </Link>
          <Link href="/reviews" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#45cab4]">
            Reviews
          </Link>
        </div>
      )}
    </header>
  );
}
