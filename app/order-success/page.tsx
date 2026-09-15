import Link from 'next/link';
import { CheckCircle2, Truck, Mail, ArrowRight, ShieldCheck, MessageSquare, Send } from 'lucide-react';

interface OrderSuccessProps {
  searchParams: Promise<{
    id?: string;
    orderId?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderId = params.id || params.orderId || 'VW-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@vapewellaustralia.com.au';

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-slate-50 text-gray-800">
      <div className="max-w-xl w-full text-center space-y-6 bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-black bg-[#45cab4] rounded-full">
            Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-gray-600">
            Order Reference: <strong className="text-[#2b9685] font-mono text-base">{orderId}</strong>
          </p>
        </div>

        {/* PROMINENT ADMIN CONTACT PROMPT */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50/60 to-white border-2 border-[#45cab4]/50 text-left space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#0f766e] font-bold text-sm uppercase tracking-wide">
            <MessageSquare className="w-5 h-5 text-[#2b9685]" />
            <span>Action Required: Contact Store Administrator</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            To ensure rapid dispatch and seamless verification, please get in touch with our store administrator directly quoting your Order Reference <strong className="text-gray-900 font-mono">[{orderId}]</strong>:
          </p>
          <div className="p-3 bg-white rounded-xl border border-teal-200/80 flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-mono font-bold text-[#0f766e] break-all">
              {adminEmail}
            </span>
            <a
              href={`mailto:${adminEmail}?subject=Order%20${orderId}%20Verification%20-%20Vape%20Well%20Australia&body=Hi%20Admin,%0D%0A%0D%0AI%20have%20placed%20order%20${orderId}.%20Please%20verify%20and%20proceed%20with%20dispatch.`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#45cab4] hover:bg-[#37b19d] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Admin</span>
            </a>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#2b9685] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block font-semibold">Confirmation Email Sent</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                We have emailed your receipt and invoice. An automatic alert has also been sent to the store admin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
            <Truck className="w-5 h-5 text-[#2b9685] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block font-semibold">Discreet Dispatch</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                Your order is packed in a 100% plain, unbranded satchel. You will receive an Australia Post tracking number once dispatched.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
            <ShieldCheck className="w-5 h-5 text-[#2b9685] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block font-semibold">Payment & Bank Transfer Reference</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                If paying via PayID or Bank Transfer, please use your Order Reference (<span className="text-[#2b9685] font-semibold">{orderId}</span>) in the payment description.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
