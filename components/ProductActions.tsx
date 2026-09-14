'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Plus, Minus, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart-context';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Extract flavor options from attributes if present, or parse from title
  const flavorAttr = product.attributes?.find(
    (a) => a.name.toLowerCase().includes('flavor') || a.name.toLowerCase().includes('flavour')
  );
  const flavorOptions = flavorAttr?.options || [];
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(
    flavorOptions[0] || undefined
  );

  const handleAddToCart = () => {
    addItem(product, quantity, selectedFlavor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedFlavor);
    router.push('/checkout');
  };

  return (
    <div className="space-y-6 pt-4 border-t border-gray-200">
      {/* Flavor Selection if options exist */}
      {flavorOptions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Select Flavour: {selectedFlavor && <span className="text-[#2b9685] font-semibold">{selectedFlavor}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {flavorOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedFlavor(opt)}
                className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  selectedFlavor === opt
                    ? 'bg-[#45cab4] text-black font-bold border-[#45cab4] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#45cab4]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector & Action Buttons */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Quantity:
        </label>
        <div className="flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-black text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-6 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-[#45cab4] hover:bg-[#37b19d] text-black'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

        {/* Buy Now Direct Button */}
        <button
          onClick={handleBuyNow}
          className="w-full py-3.5 px-6 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wider bg-[#3a3a3a] hover:bg-[#222222] text-white border border-[#3a3a3a] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Zap className="w-4 h-4 text-[#45cab4]" />
          <span>Buy It Now with Express AU Post</span>
        </button>
      </div>

      {/* Trust guarantees under CTA */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#2b9685] flex-shrink-0" />
          <span>Discreet plain satchel packaging via Australia Post</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2b9685] flex-shrink-0" />
          <span>100% Guaranteed authentic with manufacturer security code</span>
        </div>
      </div>
    </div>
  );
}
