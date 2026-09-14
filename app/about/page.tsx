import Link from 'next/link';
import { Flame, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-12 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685] text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>About Vape Well Australia</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 font-display">
            Australia&apos;s Trusted Destination for Premium Vapes
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Committed to providing adult Australians with authentic, dependable, and cutting-edge vaping devices with unmatched express service.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2b9685] block">
            Our Mission
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
            Safe, Genuine & Effortless Access Across Australia
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            At Vape Well Australia, our mission is clear: to provide Australians with the highest quality vape products from world-renowned manufacturers—ensuring authenticity, safety, satisfaction, and discreet doorstep delivery. We believe in providing adult vapers with reliable hardware without exorbitant markups or questionable counterfeit replicas.
          </p>
        </div>

        {/* Story & Background */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            Who We Are
          </h2>
          <p className="text-sm sm:text-base">
            Vape Well Australia was founded with one goal in mind: solving the widespread frustration of counterfeit devices, slow postal times, and poor customer service in the Australian vape market. Today, we stand as one of Australia’s premier independent online vape networks.
          </p>
          <p className="text-sm sm:text-base">
            We specialize in high-puff disposable vapes, refillable pod systems, and beginner-friendly starter kits. Through direct partnerships with leading brands including <strong className="text-gray-900">IGET, HQD, ALIBARBAR, VEIPUS, and RELX</strong>, we bypass intermediaries to bring fresh batches straight to your hands with certified anti-counterfeit scratch-off seals.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#45cab4]/15 border border-[#45cab4]/30 flex items-center justify-center text-[#2b9685]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">100% Anti-Counterfeit Guarantee</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Every single product we sell comes in original sealed packaging with a unique serial number and scratch verification QR code for instant authenticity checking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#45cab4]/15 border border-[#45cab4]/30 flex items-center justify-center text-[#2b9685]">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">100% Plain Discreet Packaging</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your privacy is paramount. All parcels are shipped in completely plain Australia Post satchels with neutral sender names and zero branding or vape mentions.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900 font-display">
            Ready to explore our catalog?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Browse over 2,000+ authentic disposable vapes, pod systems, and accessories ready for same-day dispatch.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <span>Explore The Shop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
