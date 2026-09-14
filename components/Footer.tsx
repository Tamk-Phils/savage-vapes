import Link from 'next/link';
import { Flame, ShieldAlert, Truck, Lock, RotateCcw, Mail, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#06050e] border-t border-[#1a192e] text-gray-400">
      {/* 18+ Nicotine Warning Banner */}
      <div className="bg-[#120707] border-b border-red-900/40 py-5 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
          <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-red-200 font-medium leading-relaxed">
            <strong className="text-white font-bold uppercase tracking-wider">Warning:</strong> Products sold on this website contain nicotine, which is a highly addictive substance. Strictly for sale and use by adults aged 18 years and older only. Keep out of reach of children and pets.
          </p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-dark to-brand flex items-center justify-center shadow-lg shadow-brand/20">
                <Flame className="w-5 h-5 text-[#020013] fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider font-display text-white">
                  VAPE<span className="text-brand">WELL</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-gray-500 -mt-1">
                  Australia
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Vape Well Australia is your trusted online destination for authentic disposable vapes, pods, and starter kits. We provide genuine products with express, discreet delivery across Sydney, Melbourne, Brisbane, Perth, and nationwide.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Truck className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Express AU Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Lock className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Plain Discreet Box</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <RotateCcw className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Dead On Arrival Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Fast 24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="hover:text-brand transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=disposable-vapes" className="hover:text-brand transition-colors">
                  Disposable Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=veipus-opal-pods" className="hover:text-brand transition-colors">
                  VEIPUS OPAL Pods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=relx-infinity-pod" className="hover:text-brand transition-colors">
                  RELX Infinity Pods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vape-kits" className="hover:text-brand transition-colors">
                  Vape Kits & Mods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vape-coils" className="hover:text-brand transition-colors">
                  Coils & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Top Brands
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop?brand=IGET" className="hover:text-brand transition-colors">
                  IGET Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=HQD" className="hover:text-brand transition-colors">
                  HQD Tech
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=ALIBARBAR" className="hover:text-brand transition-colors">
                  Alibarbar Vapes
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=RELX" className="hover:text-brand transition-colors">
                  RELX
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=VEIPUS" className="hover:text-brand transition-colors">
                  VEIPUS OPAL
                </Link>
              </li>
              <li>
                <Link href="/shop?brand=SMOK" className="hover:text-brand transition-colors">
                  SMOK & Vaporesso
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">
                  About Vape Well
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-brand transition-colors">
                  Verified Reviews
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-brand transition-colors">
                  Express Checkout
                </Link>
              </li>
              <li>
                <span className="text-xs text-gray-500 block pt-2">
                  Delivery coverage:
                </span>
                <span className="text-xs text-gray-400">
                  NSW, VIC, QLD, WA, SA, TAS, ACT, NT
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-[#1a192e] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Vape Well Australia. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Discreet Shipping via AU Post</span>
            <span>18+ Age Restricted</span>
            <span>SSL 256-Bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

