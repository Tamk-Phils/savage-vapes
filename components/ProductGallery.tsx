'use client';

import { useState } from 'react';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const displayImages = images && images.length > 0
    ? images
    : [{ id: 0, src: '/placeholder-vape.jpg', thumbnail: '/placeholder-vape.jpg', alt: productName }];

  const currentImage = displayImages[selectedIdx] || displayImages[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Feature Image */}
      <div className="relative aspect-square w-full bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex items-center justify-center p-6 group">
        <img
          src={currentImage.src}
          alt={currentImage.alt || productName}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails list */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-20 flex-shrink-0 bg-white rounded-xl overflow-hidden border p-1 transition-all ${
                selectedIdx === idx
                  ? 'border-brand ring-2 ring-brand/30 scale-95 shadow-sm'
                  : 'border-gray-200 hover:border-brand opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbnail || img.src}
                alt={img.alt || `${productName} thumb ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

