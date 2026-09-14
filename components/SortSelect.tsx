'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  currentSort: string;
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (newSort === 'popularity') {
      params.delete('sortBy');
    } else {
      params.set('sortBy', newSort);
    }
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      id="sort"
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="bg-white text-xs font-semibold text-gray-800 border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-[#45cab4] focus:outline-none cursor-pointer shadow-sm"
    >
      <option value="popularity">Popularity / Bestselling</option>
      <option value="newest">Newest Arrivals</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
    </select>
  );
}
