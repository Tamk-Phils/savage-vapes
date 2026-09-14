'use client';

import { useState } from 'react';
import { Settings, Save, Download, ShieldCheck, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Vape Well Australia',
    freeShippingThreshold: 150,
    standardShippingFee: 15,
    expressShippingFee: 22,
    supportEmail: 'support@vapewellaustralia.com.au',
    supportPhone: '1300 000 000',
    bannerText: 'FREE EXPRESS SHIPPING on Australian orders over $150 | 100% Authentic Guaranteed',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadBackup = () => {
    window.open('/api/admin/orders', '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Store Settings & Database
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure shipping rates, contact details, and database connections.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Shipping Rates */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-3">
            Australian Shipping Rates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Free Shipping Threshold ($ AUD)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Standard Shipping Fee ($ AUD)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Express Courier Fee ($ AUD)</label>
              <input
                type="number"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner & Contact */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-3">
            Store Contact & Announcement
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Top Header Announcement Bar Text</label>
              <input
                type="text"
                value={settings.bannerText}
                onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Customer Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Support Phone / Helpdesk</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#45cab4] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Data Sync */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2b9685]" />
            Database & Data Sync
          </h2>
          <p className="text-xs text-gray-500">
            Catalog dataset: <strong className="text-gray-900 font-bold">2,072 products</strong> across <strong className="text-gray-900 font-bold">89 categories</strong> extracted from primevapesaustralia.com.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider border border-gray-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Orders JSON</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Settings saved!
            </span>
          )}
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
