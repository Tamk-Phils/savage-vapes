'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  X, 
  Trash2, 
  Printer, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard
} from 'lucide-react';
import { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber }),
      });
      if (res.ok) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any, trackingNumber } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, trackingNumber });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order record?')) return;
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== orderId));
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filteredStatus === 'all' || o.status === filteredStatus;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerEmail.toLowerCase().includes(searchLower) ||
      o.shippingAddress?.suburb?.toLowerCase().includes(searchLower) ||
      o.shippingAddress?.state?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track dispatches, update Australia Post tracking numbers, and view customer invoices.
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilteredStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filteredStatus === st
                  ? 'bg-[#45cab4] text-black shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email..."
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:ring-1 focus:ring-[#45cab4] focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#45cab4]">
            <div className="w-8 h-8 border-2 border-[#45cab4] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-gray-500">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-sm font-semibold">No orders match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">State</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#2b9685]">
                      {ord.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{ord.customerName}</div>
                      <div className="text-[11px] text-gray-500">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-700">
                      {ord.shippingAddress?.state || 'AU'}
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {ord.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)} items
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">
                      ${ord.total?.toFixed(2)} AUD
                    </td>
                    <td className="p-3.5 uppercase font-semibold text-gray-600">
                      {ord.paymentMethod}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'shipped'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : ord.status === 'processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setTrackingInput(ord.trackingNumber || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#45cab4]/15 hover:bg-[#45cab4]/30 text-[#2b9685] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2b9685]">
                  Order Details
                </span>
                <h2 className="text-xl font-black text-gray-900 font-mono">
                  {selectedOrder.id}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Status & Tracking Controls */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Update Order Status
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value, trackingInput)}
                  className="bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-xl px-3 py-2 focus:border-[#45cab4] focus:outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Australia Post Tracking (e.g. AUPOST-123456)"
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                />

                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status, trackingInput)}
                  className="px-4 py-2 rounded-xl bg-[#45cab4] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#37b19d] cursor-pointer"
                >
                  Save Tracking
                </button>
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <h3 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#2b9685]" />
                  Customer Information
                </h3>
                <p className="text-gray-900 font-semibold">{selectedOrder.customerName}</p>
                <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                <p className="text-gray-600 pt-1">Payment Method: <strong className="text-gray-900 uppercase">{selectedOrder.paymentMethod}</strong></p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <h3 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2b9685]" />
                  Australian Delivery Address
                </h3>
                <p className="text-gray-900">{selectedOrder.shippingAddress?.addressLine1}</p>
                {selectedOrder.shippingAddress?.addressLine2 && (
                  <p className="text-gray-600">{selectedOrder.shippingAddress?.addressLine2}</p>
                )}
                <p className="text-gray-900">
                  {selectedOrder.shippingAddress?.suburb}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postcode}
                </p>
                <p className="text-gray-600">Country: {selectedOrder.shippingAddress?.country || 'Australia'}</p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Order Items ({selectedOrder.items?.length})
              </h3>
              <div className="divide-y divide-gray-100 rounded-xl bg-gray-50 border border-gray-200 p-4">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 p-1 flex-shrink-0">
                        <img
                          src={item.productImage || '/placeholder-vape.jpg'}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">{item.productName}</span>
                        {item.selectedFlavor && (
                          <span className="text-gray-500 text-[11px]">Flavor: {item.selectedFlavor}</span>
                        )}
                        <span className="text-gray-400 text-[11px] block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)} AUD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
              <span className="text-gray-500">Total Charged</span>
              <span className="text-2xl font-black text-[#2b9685] font-display">
                ${selectedOrder.total?.toFixed(2)} AUD
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
