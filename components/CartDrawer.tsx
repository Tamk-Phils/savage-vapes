'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, subtotal, itemCount, updateQuantity, removeItem } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white border-l border-gray-200 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-300 text-gray-900">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2b9685]" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-display">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Discreet Shipping Banner */}
        <div className="py-2.5 px-4 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between text-xs text-teal-900 font-medium">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#2b9685]" />
            <span>Discreet Australia-wide Courier Delivery</span>
          </div>
          <span className="text-[11px] font-bold text-[#0f766e]">Tracked</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                Looks like you haven&apos;t added any vapes yet. Explore our bestsellers or new arrivals!
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 rounded-full bg-[#45cab4] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#37b19d] transition-colors cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            items.map((item) => {
              const p = item.product;
              const unitPrice = p.on_sale && p.sale_price ? p.sale_price : p.price;
              const itemTotal = unitPrice * item.quantity;
              const imageSrc = p.images?.[0]?.src || '/placeholder-vape.jpg';

              return (
                <div key={`${p.id}-${item.selectedFlavor || 'default'}`} className="pt-3.5 first:pt-0 flex gap-3.5">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative p-1">
                    <img
                      src={imageSrc}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={closeCart}
                          className="text-xs font-semibold text-gray-900 hover:text-[#2b9685] transition-colors line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        <button
                          onClick={() => removeItem(p.id, item.selectedFlavor)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.selectedFlavor && (
                        <p className="text-[11px] text-gray-500">
                          Flavor: {item.selectedFlavor}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity - 1, item.selectedFlavor)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity + 1, item.selectedFlavor)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ${itemTotal.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 block -mt-1">
                          AUD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <div className="text-right">
                <span className="text-lg font-black text-gray-900">${subtotal.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-1">AUD</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2b9685]" />
              Taxes included. Standard or Express AU Post calculated at checkout.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-black bg-[#45cab4] hover:bg-[#37b19d] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
