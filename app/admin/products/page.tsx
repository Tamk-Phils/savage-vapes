'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Savage',
    price: '',
    regular_price: '',
    sale_price: '',
    on_sale: false,
    is_in_stock: true,
    categories: 'Disposable Vapes',
    short_description: '',
    description: '',
    imageUrl: '',
  });

  const fetchProducts = async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${p}&limit=15&search=${encodeURIComponent(s)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, search);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchProducts(newPage, search);
  };

  // Toggle in stock
  const handleToggleStock = async (product: Product) => {
    try {
      const updatedStock = !product.is_in_stock;
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_in_stock: updatedStock }),
      });
      if (res.ok) {
        setProducts(products.map((p) => (p.id === product.id ? { ...p, is_in_stock: updatedStock } : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts(page, search);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cats = formData.categories.split(',').map((c) => c.trim()).filter(Boolean);
      const images = formData.imageUrl ? [{ id: 1, src: formData.imageUrl, thumbnail: formData.imageUrl, alt: formData.name }] : [];

      const payload = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        regular_price: Number(formData.regular_price || formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        on_sale: formData.on_sale,
        is_in_stock: formData.is_in_stock,
        categories: cats,
        short_description: formData.short_description,
        description: formData.description,
        images,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          brand: 'Savage',
          price: '',
          regular_price: '',
          sale_price: '',
          on_sale: false,
          is_in_stock: true,
          categories: 'Disposable Vapes',
          short_description: '',
          description: '',
          imageUrl: '',
        });
        fetchProducts(1, '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update existing product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const cats = formData.categories.split(',').map((c) => c.trim()).filter(Boolean);
      const images = formData.imageUrl ? [{ id: 1, src: formData.imageUrl, thumbnail: formData.imageUrl, alt: formData.name }] : editingProduct.images;

      const payload = {
        id: editingProduct.id,
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        regular_price: Number(formData.regular_price || formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        on_sale: formData.on_sale,
        is_in_stock: formData.is_in_stock,
        categories: cats,
        short_description: formData.short_description,
        description: formData.description,
        images,
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingProduct(null);
        fetchProducts(page, search);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      regular_price: String(p.regular_price || p.price),
      sale_price: p.sale_price ? String(p.sale_price) : '',
      on_sale: p.on_sale,
      is_in_stock: p.is_in_stock,
      categories: p.categories?.join(', ') || '',
      short_description: p.short_description || '',
      description: p.description || '',
      imageUrl: p.images?.[0]?.src || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Catalog Products ({total.toLocaleString()})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage inventory, stock statuses, pricing and specifications.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              brand: 'Savage',
              price: '',
              regular_price: '',
              sale_price: '',
              on_sale: false,
              is_in_stock: true,
              categories: 'Disposable Vapes',
              short_description: '',
              description: '',
              imageUrl: '',
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, brand, or flavor..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#45cab4]">
            <div className="w-8 h-8 border-2 border-[#45cab4] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-gray-500">Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Product</th>
                  <th className="p-3.5">Brand</th>
                  <th className="p-3.5">Price (AUD)</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5">On Sale</th>
                  <th className="p-3.5 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={p.images?.[0]?.src || '/placeholder-vape.jpg'}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <span className="font-semibold text-gray-900 block truncate">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {p.id}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-[#2b9685]">{p.brand}</td>
                    <td className="p-3.5 font-bold text-gray-900">${p.price.toFixed(2)}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          p.is_in_stock
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {p.is_in_stock ? '● In Stock' : '✕ Out of Stock'}
                      </button>
                    </td>
                    <td className="p-3.5">
                      {p.on_sale ? (
                        <span className="text-emerald-700 font-bold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                        title="Edit product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="Delete product"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs bg-gray-50/50">
            <span className="text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. IGET Bar 3500 - Lush Ice"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. IGET, HQD, ALIBARBAR"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Price in AUD *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.00"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Regular Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.regular_price}
                    onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                    placeholder="35.00"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Sale Price (if on sale)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="24.00"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Categories (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    placeholder="Disposable Vapes, IGET Bar"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full product overview and specifications..."
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.on_sale}
                    onChange={(e) => setFormData({ ...formData, on_sale: e.target.checked })}
                    className="w-4 h-4 rounded text-[#45cab4] focus:ring-[#45cab4]"
                  />
                  <span>Mark as On Sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_in_stock}
                    onChange={(e) => setFormData({ ...formData, is_in_stock: e.target.checked })}
                    className="w-4 h-4 rounded text-[#45cab4] focus:ring-[#45cab4]"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
