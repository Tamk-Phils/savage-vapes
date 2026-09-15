import Link from 'next/link';
import { Flame, ShieldAlert, Truck, Lock, RotateCcw, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600">
      {/* 18+ Nicotine Warning Banner - High Contrast Clean Light Warning */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
          <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
            <strong className="text-amber-950 font-bold uppercase tracking-wider">Warning:</strong> Products sold on this website contain nicotine, which is a highly addictive substance. Strictly for sale and use by adults aged 18 years and older only. Keep out of reach of children and pets.
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0d9488] to-[#45cab4] flex items-center justify-center shadow-md shadow-teal-700/15">
                <Flame className="w-5 h-5 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider font-display text-slate-900">
                  VAPE<span className="text-[#0d9488]">WELL</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-slate-500 -mt-1">
                  Australia
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Vape Well Australia is your trusted online destination for authentic disposable vapes, pods, and starter kits. We provide genuine products with express, discreet courier delivery across Sydney, Melbourne, Brisbane, Perth, and nationwide.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Truck className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                <span>Express AU Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Lock className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                <span>Plain Discreet Box</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <RotateCcw className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                <span>Dead On Arrival Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Mail className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                <span>Fast 24/7 AU Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=disposable-vapes" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Disposable Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=veipus-opal-pods" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  VEIPUS OPAL Pods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=relx-infinity-pod" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  RELX Infinity Pods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vape-kits" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Vape Kits & Mods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vape-coils" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Coils & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Top Brands
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/shop?brand=IGET" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  IGET Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=HQD" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  HQD Tech
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=ALIBARBAR" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Alibarbar Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=RELX" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  RELX Pods
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=VEIPUS" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  VEIPUS OPAL
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=SMOK" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  SMOK & Vaporesso
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  About Vape Well
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Verified Reviews
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-slate-600 hover:text-[#0d9488] transition-colors">
                  Express Checkout
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400 block pt-2">
                  Delivery coverage:
                </span>
                <span className="text-xs font-medium text-slate-600">
                  NSW, VIC, QLD, WA, SA, TAS, ACT, NT
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Vape Well Australia. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Discreet Shipping via AU Post</span>
            <span>•</span>
            <span>18+ Age Restricted</span>
            <span>•</span>
            <span>SSL 256-Bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
