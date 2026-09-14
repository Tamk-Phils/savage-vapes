import Link from 'next/link';
import { CheckCircle2, Truck, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface OrderSuccessProps {
  searchParams: Promise<{
    id?: string;
    orderId?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderId = params.id || params.orderId || 'VW-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#f5f5f5] text-gray-800">
      <div className="max-w-xl w-full text-center space-y-6 bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm">
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
            Order Reference: <strong className="text-[#2b9685] font-mono">{orderId}</strong>
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#2b9685] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block font-semibold">Confirmation Email Sent</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                We have emailed your order summary and invoice. Please check your inbox (and spam/junk folder).
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
              <strong className="text-gray-900 block font-semibold">PayID & Bank Transfer Notes</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                If you chose PayID/Bank Transfer, please use your Order Reference (<span className="text-[#2b9685] font-semibold">{orderId}</span>) as payment description for immediate dispatch.
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
