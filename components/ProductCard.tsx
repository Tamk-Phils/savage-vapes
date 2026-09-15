'use client';

import Link from 'next/link';
import { Star, Check, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageSrc = product.images?.[0]?.src || '/placeholder-vape.jpg';
  const displayPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;

  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 hover:border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Thumbnail Container */}
      <Link href={`/product/${product.slug}`} className="relative block aspect-square w-full bg-white p-4 overflow-hidden border-b border-gray-50">
        {product.on_sale && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black bg-[#45cab4] rounded-full shadow-sm">
            Sale
          </span>
        )}

        {product.images?.[0]?.src ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs uppercase">
            {product.brand}
          </div>
        )}
      </Link>

      {/* Product Summary */}
      <div className="p-4 flex flex-col flex-1 text-left">
        {/* Category / Brand Link */}
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {product.brand}
        </span>

        {/* Product Title */}
        <Link href={`/product/${product.slug}`} className="mb-2">
          <h3 className="text-sm font-semibold text-[#3a3a3a] group-hover:text-[#45cab4] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-[#fcb900]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 fill-current"
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            ({product.review_count > 0 ? product.review_count : '1'})
          </span>
        </div>

        {/* Price display */}
        <div className="mb-3">
          <span className="text-base font-bold text-[#3a3a3a]">
            ${displayPrice.toFixed(2)}
          </span>
          {product.on_sale && product.regular_price > displayPrice && (
            <span className="text-xs text-gray-400 line-through ml-2">
              ${product.regular_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rounded Pill Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`mt-auto w-full py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-2xs ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm hover:shadow'
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Cart</span>
            </>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>
      </div>
    </div>
  );
}
