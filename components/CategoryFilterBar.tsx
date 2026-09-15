'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderTree, Search, X, Check, Layers } from 'lucide-react';
import { ProductCategory } from '@/types';

interface CategoryFilterBarProps {
  categories: ProductCategory[];
  activeCategory?: string;
  totalProducts: number;
}

export default function CategoryFilterBar({
  categories,
  activeCategory,
  totalProducts,
}: CategoryFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Curated popular quick-access categories
  const popularCategories = [
    { slug: 'disposable-vapes', name: 'Disposable Vapes' },
    { slug: 'iget', name: 'IGET' },
    { slug: 'hqd', name: 'HQD' },
    { slug: 'alibarbar', name: 'ALIBARBAR' },
    { slug: 'relx-infinity-pod', name: 'RELX Pods' },
    { slug: 'veipus-opal-pods', name: 'VEIPUS OPAL' },
    { slug: 'vape-kits', name: 'Vape Kits' },
    { slug: 'vape-coils', name: 'Coils & Pods' },
    { slug: 'bundle', name: 'Bundles & Cartons' },
  ];

  const handleSelectCategory = (catSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug) {
      params.set('category', catSlug);
    } else {
      params.delete('category');
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
      setIsModalOpen(false);
    });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3 mb-6">
      {/* Quick Scrollable Horizontal Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {/* All Products button */}
        <button
          onClick={() => handleSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            !activeCategory
              ? 'bg-[#0d9488] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Products</span>
          <span className="text-[10px] opacity-75">({totalProducts})</span>
        </button>

        {/* Popular Category Shortcuts */}
        {popularCategories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => handleSelectCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#0d9488] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {/* Browse All 89 Categories Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>All 89 Categories...</span>
        </button>
      </div>

      {/* Category Selection Modal for Full Catalog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#0d9488]" />
                <h3 className="font-black text-slate-900 font-display text-base sm:text-lg">
                  Browse All Categories ({categories.length})
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Categories */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter categories (e.g. IGET, HQD, coils, pods)..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488]"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectCategory(null)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                  !activeCategory
                    ? 'bg-teal-50/70 border-[#0d9488] text-[#0d9488] font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs sm:text-sm">All Categories (Full Catalog)</span>
                {!activeCategory && <Check className="w-4 h-4 text-[#0d9488]" />}
              </button>

              {filteredCategories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-50/70 border-[#0d9488] text-[#0d9488] font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm truncate pr-2">{cat.name}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {cat.count !== undefined && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {cat.count}
                        </span>
                      )}
                      {isActive && <Check className="w-4 h-4 text-[#0d9488]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredCategories.length} categories</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

