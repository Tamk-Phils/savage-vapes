import Link from 'next/link';
import { 
  Flame, 
  ArrowRight, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Headset,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { 
  getBestDisposablesSection, 
  getNewArrivalsSection, 
  getRelxPodsSection, 
  getVapeKitsSection, 
  getOpalPodsSection, 
  getGeekBarSection,
  getReviews 
} from '@/lib/products';
import { getFeaturedPosts } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';

export default async function HomePage() {
  const [
    bestDisposables,
    newArrivals,
    relxPods,
    vapeKits,
    opalPods,
    geekBars,
    reviews
  ] = await Promise.all([
    getBestDisposablesSection(4),
    getNewArrivalsSection(4),
    getRelxPodsSection(6),
    getVapeKitsSection(6),
    getOpalPodsSection(6),
    getGeekBarSection(4),
    getReviews(),
  ]);

  const featuredPosts = getFeaturedPosts(3);

  // 11 Exact Circular Category Tiles from primevapesaustralia.com
  const categoryTiles = [
    {
      name: 'Fisco Mix Bar 12000',
      slug: 'fisco-mix-bar-12000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Fisco-mix-bar-12000-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'RELX MagicGo 8000i',
      slug: 'relx-magicgo-8000i',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/RELX-Magicgo-8000i-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'Groo Slim 9000',
      slug: 'groo-slim-9000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Groo-Slim-9000-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'Bimo Crystal 12000',
      slug: 'bimo-crystal-12000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Bimo-crystal-12000-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'IGET Bar 3500',
      slug: 'iget-bar-3500',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/iget-bar-3500-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'Alibarbar Ingot 9000',
      slug: 'alibarbar-ingot-9000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Alibarbar-ingot-9000-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'Kuz Lux 9000',
      slug: 'kuz-lux-9000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Kuz-lux-9000-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'HQD Cuvie Slick',
      slug: 'hqd-cuvie-slick-20000-puffs',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/HQD-Cuvie-Slick-category-Vapesaustralia-300x300-1-150x150.jpg'
    },
    {
      name: 'IGET One 12000',
      slug: 'iget-one-12000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Iget-one-12000-category-300x300-1-150x150.jpg'
    },
    {
      name: 'HQD Miracle',
      slug: 'hqd-miracle',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/hqd-miracle-category-300x300-1-150x150.jpg'
    },
    {
      name: 'Serein Mechpro 10000',
      slug: 'serein-mechpro-10000',
      image: 'https://primevapesaustralia.com/wp-content/uploads/2025/08/Serein-mechpro-10000-category-Vapesaustralia-300x300-1-150x150.jpg'
    }
  ];

  const faqs = [
    {
      q: "Where can I buy vape kits online in Australia?",
      a: "You can buy vape kits online in Australia from Vape Well Australia. We offer a wide range of starter and advanced vape kits, ensuring you find the right device for your vaping needs, with fast and reliable shipping."
    },
    {
      q: "Do you sell vape coils and pods in Australia?",
      a: "Yes, we offer a variety of vape coils and replacement pods to ensure your device stays in optimal working condition. Our products are authentic and sourced from top manufacturers."
    },
    {
      q: "What are the best e-liquids in Australia?",
      a: "The best e-liquids depend on your flavour preferences and device. At Vape Well Australia, we carry a wide range of premium flavours, from classic tobacco and menthol to fruity and dessert options."
    },
    {
      q: "Do you offer vape accessories in Australia?",
      a: "Yes, we provide essential vape accessories including batteries, chargers, replacement glass, and drip tips to keep your device running smoothly."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5] text-[#3a3a3a]">
      {/* 1. HERO SECTION matching primevapesaustralia.com with Authentic Hardware Imagery */}
      <section 
        className="relative text-center text-white py-24 sm:py-32 md:py-40 px-4 bg-cover bg-center overflow-hidden border-b border-slate-200/50"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.76)), url('https://primevapesaustralia.com/wp-content/uploads/2026/06/vape-vaporizers-pod-system-pod-mod-wallpaper-preview.jpg')`
        }}
      >
        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#45cab4] text-xs font-bold uppercase tracking-wider shadow-sm">
            <span>🇦🇺 Australia&apos;s Trusted Online Vape Store</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase drop-shadow-md">
            Vape Well <span className="text-[#45cab4]">Australia</span>
          </h1>

          {/* Cyan/Teal accent divider line */}
          <div className="w-24 h-1.5 bg-[#45cab4] mx-auto rounded-full shadow-sm" />

          <p className="text-base sm:text-xl font-medium text-slate-100 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            The Best Online Vape Store for Disposable Vapes Australia. Genuine Products with Scratch-Off Verification & Discreet Nationwide Delivery.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#45cab4] hover:bg-[#38b29e] text-black text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-teal-900/30 hover:shadow-xl active:scale-95 cursor-pointer"
            >
              <span>Explore 2,000+ Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?category=disposable-vapes"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-sm font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Shop Disposable Vapes
            </Link>
          </div>

          {/* Key Value Micro-Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#45cab4]" />
              100% Authentic Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#45cab4]" />
              Discreet Plain Satchel
            </span>
            <span className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#45cab4]" />
              Same-Day AU Dispatch
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTRO & CIRCULAR CATEGORY TILES matching .elementor-element-31dd2b9 */}
      <section className="py-14 px-4 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
            Buy Vapes Online Australia | Bulk Disposable Vapes Shop Australia | Vape Shop Australia
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Are you a vaper out of stock for your favorite vape flavor and is looking for legitimate place to source them from? Buy vapes online Australia cheap from <strong className="text-black">VAPE WELL AUSTRALIA</strong> and discover our full range of <Link href="/shop?category=disposable-vapes" className="text-[#45cab4] hover:underline font-semibold">IGET vapes online Australia</Link>, disposable vapes, vape kits, replacement vape pods, coils e-liquids, and more to <Link href="/shop" className="text-[#45cab4] hover:underline font-semibold">buy online Australia</Link> and have the fastest shipping experience – All products are 100% authentic, with trusted and secure payment options and express shipping Australia-wide. <Link href="/shop?category=disposable-vapes" className="text-[#45cab4] hover:underline font-semibold">Buy Disposable vapes online Australia</Link> with <strong className="text-black">VAPE WELL AUSTRALIA</strong> today and get <strong className="text-black">5%</strong> off your entire first order.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#3a3a3a] font-display pt-4">
            Buy Disposable Vapes Online Australia | IGET vapes Australia
          </h2>

          {/* 11 Exact Circular Category Tiles */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto py-6 px-2 scrollbar-none">
            {categoryTiles.map((tile, idx) => (
              <Link
                key={idx}
                href={`/shop?search=${encodeURIComponent(tile.name.split(' ')[0])}`}
                className="flex flex-col items-center gap-2 group flex-shrink-0 w-24 sm:w-28 text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-gray-200 group-hover:border-[#45cab4] p-1 overflow-hidden transition-all duration-300 shadow-sm group-hover:scale-105">
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs font-semibold text-[#3a3a3a] group-hover:text-[#45cab4] transition-colors line-clamp-2">
                  {tile.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BEST DISPOSABLE VAPES AUSTRALIA matching .elementor-element-e08f5e7 */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              BEST DISPOSABLE VAPES AUSTRALIA | IGET Vapes Online Australia
            </h2>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
              VAPE WELL AUSTRALIA is the number one trusted online vape store to buy vapes online in Australia. Check out our wide range of authentic disposable vapes for sale in Australia.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {bestDisposables.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS – DISPOSABLE VAPES AUSTRALIA matching .elementor-element-1520173 */}
      <section className="py-14 px-4 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              NEW ARRIVALS – DISPOSABLE VAPES AUSTRALIA | buy vapes Australia
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 10 Pack Banner Tile - Modern Clean Light Gradient */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/60 to-slate-50 border border-teal-200 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200">
                Bulk Value Deals
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                10 PACK – IGET BAR PRO – 10000 PUFFS
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Save up to 30% with multi-pack cartons and priority courier shipping Australia-wide.
              </p>
            </div>
            <Link
              href="/shop?category=bundle"
              className="px-8 py-3.5 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex-shrink-0 cursor-pointer"
            >
              Shop 10 Packs
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BUY RELX PODS ONLINE AUSTRALIA matching .elementor-element-8202676 */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Buy Relx Pods Online Australia - Relx Pods Australia
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-4">
            {relxPods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. VAPE KITS & E-LIQUIDS matching .elementor-element-387cfd0 */}
      <section className="py-14 px-4 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Buy Vape Kits & E-Liquids Australia | Best vape kits Australia | Disposable vape kits australia
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-4">
            {vapeKits.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. BUY OPAL PODS ONLINE AUSTRALIA matching .elementor-element-bd17fc7 */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Buy Opal Pods online Australia - Viepus Opal Pods Australia
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 pt-4">
            {opalPods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. BUY E-LIQUIDS, NICOTINE POUCHES & MORE matching .elementor-element-4fe8a56 */}
      <section className="py-14 px-4 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Buy E-Liquids, Nicotine Pouches & More
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {geekBars.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. SEO ARTICLE CONTENT matching .elementor-element-fbd6b92 */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto space-y-8 text-gray-700 leading-relaxed text-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] text-center font-display">
            All Your Vape Kits and E-Liquid Needs in Australia
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-[#3a3a3a]">
                Vape Kits to Suit Any Style in Australia
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Whether you prefer the simplicity of disposable vapes, portable pod systems, or high-wattage box mod kits, Vape Well Australia provides tailored solutions for every customer.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-[#3a3a3a]">
                Buy Quality E-Liquids Online Australia
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Explore an extensive collection of nicotine salts and freebase vape juices crafted for rich flavour and optimal throat hit across all compatible devices.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-[#3a3a3a]">
                Vape Coils & Accessories Australia
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Maintain optimal performance with authentic coils, replacement glass, batteries, and lanyards for leading brands including SMOK, Vaporesso, and Uwell.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-[#3a3a3a]">
                Vape Shop Australia | The Best Place to Buy Vapes Online
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Enjoy fast dispatch, guaranteed authenticity with scratch codes, discreet plain packaging, and reliable Australia Post shipping to all Australian states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQS matching .elementor-element-94f6bd9 */}
      <section className="py-14 px-4 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] text-center font-display">
            FAQs
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group p-5 rounded-xl border border-gray-200 bg-[#fafafa] open:bg-white open:border-[#45cab4] transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold text-[#3a3a3a] text-sm sm:text-base">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-[#45cab4] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. BEST ONLINE VAPE STORE AUSTRALIA (4 Value Pillars) matching .elementor-element-a615b8d */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Best Online Vape Store Australia
            </h2>
            <p className="text-sm text-gray-500">Australia’s Trusted Vape Store</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-[#45cab4] mx-auto" />
              <h3 className="font-bold text-sm text-[#3a3a3a]">Authentic Products</h3>
              <p className="text-xs text-gray-500">100% genuine with scratch-off manufacturer verification codes.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
              <Truck className="w-10 h-10 text-[#45cab4] mx-auto" />
              <h3 className="font-bold text-sm text-[#3a3a3a]">Express Shipping</h3>
              <p className="text-xs text-gray-500">Fast, trackable delivery in discreet plain packaging across Australia.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
              <CreditCard className="w-10 h-10 text-[#45cab4] mx-auto" />
              <h3 className="font-bold text-sm text-[#3a3a3a]">Secure Payment</h3>
              <p className="text-xs text-gray-500">PayID, direct bank transfer, and encrypted card checkout.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-2">
              <Headset className="w-10 h-10 text-[#45cab4] mx-auto" />
              <h3 className="font-bold text-sm text-[#3a3a3a]">Customer Support</h3>
              <p className="text-xs text-gray-500">Friendly Australian team available to answer questions anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. WHO WE ARE matching .elementor-element-6512fd9 */}
      <section className="py-14 px-4 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              WHO WE ARE?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-black">VAPE WELL AUSTRALIA</strong> is one of Australia’s leading vape networks, established in 2020. We specialize in bringing adult vapers the highest quality hardware from reputable manufacturers.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              We focus on disposable vapes—easy to use, highly convenient, and in tune with modern vaping lifestyles. We partner with industry leaders like IGET, ALIBARBAR, BIMO, and RELX to deliver the latest, most reliable devices to our customers nationwide.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-gray-50 p-6 border border-gray-200">
            <img
              src="https://primevapesaustralia.com/wp-content/uploads/2025/08/04_1.png"
              alt="Who We Are"
              className="max-h-72 object-contain"
            />
          </div>
        </div>
      </section>

      {/* 13. CUSTOMER'S REVIEWS matching .elementor-element-c8ca9a3 */}
      <section className="py-14 px-4 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#3a3a3a] font-display">
              Customer&apos;s Reviews
            </h2>
            <div className="flex items-center justify-center gap-1 text-[#fcb900]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex text-[#fcb900]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#3a3a3a] block">{rev.author}</span>
                    <span className="text-gray-400">{rev.city}, {rev.state}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#45cab4]">
                    <PackageCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. LATEST VAPE GUIDES & REVIEWS */}
      {featuredPosts && featuredPosts.length > 0 && (
        <section className="py-16 px-4 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#0d9488] text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Knowledge & Hardware Insights</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 font-display">
                  Latest Vape Guides & Reviews
                </h2>
                <p className="text-sm text-gray-600 max-w-xl">
                  Read our in-depth device breakdowns, puff-count comparisons, and flavor guides before you buy.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0d9488] hover:underline"
              >
                <span>Explore All 25 Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
