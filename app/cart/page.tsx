'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const freeShippingThreshold = 150;
  const amountUntilFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const discountPercent = couponApplied ? 0.10 : 0;
  const discountAmount = subtotal * discountPercent;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const finalTotal = subtotal - discountAmount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'VAPEWELL10' || code === 'SAVAGE10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try VAPEWELL10 for 10% off.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-[#f5f5f5]">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#45cab4]/15 border border-[#45cab4]/30 text-[#2b9685] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Looks like you haven&apos;t added any authentic disposable vapes or pod kits yet.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Explore The Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#2b9685] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Cart</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table / Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Free Shipping Progress Meter */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Truck className="w-4 h-4 text-[#2b9685]" />
                  {amountUntilFreeShipping > 0 ? (
                    <span>
                      Add <strong className="text-[#2b9685] font-bold">${amountUntilFreeShipping.toFixed(2)} AUD</strong> more to unlock Free Express Delivery!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      🎉 Congratulations! You have unlocked FREE Express AU Shipping!
                    </span>
                  )}
                </div>
                <span className="text-gray-500">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#45cab4] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Products List */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {items.map((item) => {
                const p = item.product;
                const unitPrice = p.on_sale && p.sale_price ? p.sale_price : p.price;
                const itemTotal = unitPrice * item.quantity;
                const imageSrc = p.images?.[0]?.src || '/placeholder-vape.jpg';

                return (
                  <div key={`${p.id}-${item.selectedFlavor || 'default'}`} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                        <img
                          src={imageSrc}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b9685]">
                          {p.brand}
                        </span>
                        <Link
                          href={`/product/${p.slug}`}
                          className="text-sm font-bold text-gray-900 hover:text-[#2b9685] transition-colors block truncate"
                        >
                          {p.name}
                        </Link>
                        {item.selectedFlavor && (
                          <p className="text-xs text-gray-500">
                            Flavor: <span className="text-gray-800 font-medium">{item.selectedFlavor}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 sm:hidden">
                          Unit: ${unitPrice.toFixed(2)} AUD
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50">
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity - 1, item.selectedFlavor)}
                          className="p-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity + 1, item.selectedFlavor)}
                          className="p-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-base font-black text-gray-900 block">
                          ${itemTotal.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500">AUD</span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(p.id, item.selectedFlavor)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="text-xs font-bold uppercase tracking-wider text-[#2b9685] hover:underline"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                Empty Cart
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)} AUD</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-700">FREE</span>
                  ) : (
                    <span className="font-bold text-gray-900">${shippingFee.toFixed(2)} AUD</span>
                  )}
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount (VAPEWELL10 - 10%)</span>
                    <span>-${discountAmount.toFixed(2)} AUD</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Estimated Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#2b9685] font-display">
                      ${finalTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">AUD</span>
                  </div>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. VAPEWELL10)"
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#45cab4] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider border border-gray-300 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1.5">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-[11px] text-emerald-700 mt-1.5 font-semibold">Coupon applied: 10% off!</p>
                )}
              </form>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-full bg-[#45cab4] hover:bg-[#37b19d] text-black text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Guarantee badges */}
              <div className="pt-2 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2b9685] flex-shrink-0" />
                  <span>Discreet plain Australia Post packaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#2b9685] flex-shrink-0" />
                  <span>Zero-risk dead on arrival replacement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
