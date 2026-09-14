'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Clock, 
  ArrowRight,
  Plus
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-[#45cab4]">
        <div className="w-8 h-8 border-2 border-[#45cab4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-[#2b9685]',
      bgColor: 'bg-[#45cab4]/15 border-[#45cab4]/30',
    },
    {
      label: 'Pending Dispatch',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Catalog Products',
      value: stats?.totalProducts || 2072,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Admin Overview & Metrics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time management for Savage Vapes Australia store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors shadow-sm"
          >
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bgColor} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-gray-900 block">
                {card.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Order Status Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-amber-700 font-bold block mb-0.5">Pending</span>
            <span className="text-xl font-black text-gray-900">{stats?.statusBreakdown?.pending || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-blue-700 font-bold block mb-0.5">Processing</span>
            <span className="text-xl font-black text-gray-900">{stats?.statusBreakdown?.processing || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
            <span className="text-teal-700 font-bold block mb-0.5">Shipped</span>
            <span className="text-xl font-black text-gray-900">{stats?.statusBreakdown?.shipped || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-emerald-700 font-bold block mb-0.5">Completed</span>
            <span className="text-xl font-black text-gray-900">{stats?.statusBreakdown?.completed || 0}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-red-700 font-bold block mb-0.5">Cancelled</span>
            <span className="text-xl font-black text-gray-900">{stats?.statusBreakdown?.cancelled || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-gray-500">
              Latest transactions placed across Australian states.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#2b9685] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 rounded-l-lg">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-lg">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentOrders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#2b9685]">
                      {ord.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-gray-900">{ord.customerName}</div>
                      <div className="text-[11px] text-gray-500">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {ord.shippingAddress?.suburb}, {ord.shippingAddress?.state} {ord.shippingAddress?.postcode}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">
                      ${ord.total?.toFixed(2)} AUD
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
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-white border border-gray-300 text-[11px] text-gray-800 rounded-lg px-2 py-1 focus:border-[#45cab4] focus:outline-none cursor-pointer shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
