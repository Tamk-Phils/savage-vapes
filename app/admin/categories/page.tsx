'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Search, X } from 'lucide-react';
import { ProductCategory } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewCatName('');
        setNewCatSlug('');
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize catalog groupings, puff tiers, and brands.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#45cab4]">
            <div className="w-8 h-8 border-2 border-[#45cab4] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Category Name</th>
                  <th className="p-3.5">Slug</th>
                  <th className="p-3.5">Product Count</th>
                  <th className="p-3.5 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">
                      {cat.name}
                    </td>
                    <td className="p-3.5 font-mono text-gray-500">
                      {cat.slug}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#45cab4]/15 text-[#2b9685] font-bold text-[11px] border border-[#45cab4]/30">
                        {cat.count || 0} items
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              Add Category
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Geek Bar Pulse"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Slug</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="geek-bar-pulse"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
