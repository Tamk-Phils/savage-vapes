import Link from 'next/link';
import { Suspense } from 'react';
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  X 
} from 'lucide-react';
import { getProducts, getCategories, getTopBrands } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import SortSelect from '@/components/SortSelect';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category;
  const brand = resolvedParams.brand;
  const search = resolvedParams.search;
  const sortBy = resolvedParams.sort || 'popularity';
  const currentPage = Number(resolvedParams.page) || 1;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;

  const limit = 24;

  const [{ products, total, totalPages }, categories, topBrands] = await Promise.all([
    getProducts({
      category,
      brand,
      search,
      sortBy: sortBy as any,
      page: currentPage,
      limit,
      minPrice,
      maxPrice,
    }),
    getCategories(),
    getTopBrands(),
  ]);

  // Query helper to preserve other active filters
  const createQueryString = (paramsToUpdate: Record<string, string | number | null>) => {
    const current = new URLSearchParams();
    if (category) current.set('category', category);
    if (brand) current.set('brand', brand);
    if (search) current.set('search', search);
    if (sortBy && sortBy !== 'popularity') current.set('sort', sortBy);
    if (minPrice !== undefined) current.set('minPrice', String(minPrice));
    if (maxPrice !== undefined) current.set('maxPrice', String(maxPrice));

    Object.entries(paramsToUpdate).forEach(([key, val]) => {
      if (val === null || val === undefined) {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });

    const str = current.toString();
    return str ? `/shop?${str}` : '/shop';
  };

  const hasActiveFilters = Boolean(category || brand || search || minPrice || maxPrice);

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6 space-y-2">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#2b9685] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shop</span>
            {category && (
              <>
                <span>/</span>
                <span className="text-[#2b9685] capitalize">{category.replace(/-/g, ' ')}</span>
              </>
            )}
            {brand && (
              <>
                <span>/</span>
                <span className="text-[#2b9685]">{brand}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
                {search
                  ? `Search Results for "${search}"`
                  : category
                  ? category.replace(/-/g, ' ').toUpperCase()
                  : brand
                  ? `${brand.toUpperCase()} VAPES`
                  : 'All Vape Products'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Showing {products.length > 0 ? (currentPage - 1) * limit + 1 : 0} –{' '}
                {Math.min(currentPage * limit, total)} of {total} products
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-xs font-semibold text-gray-600">
                Sort By:
              </label>
              <Suspense fallback={
                <div className="bg-white text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-500 shadow-sm">
                  Loading...
                </div>
              }>
                <SortSelect currentSort={sortBy} />
              </Suspense>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {category && (
                <Link
                  href={createQueryString({ category: null, page: 1 })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#2b9685] bg-[#45cab4]/15 border border-[#45cab4]/30 rounded-full hover:bg-[#45cab4]/25 transition-colors"
                >
                  <span>Category: {category}</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              {brand && (
                <Link
                  href={createQueryString({ brand: null, page: 1 })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#2b9685] bg-[#45cab4]/15 border border-[#45cab4]/30 rounded-full hover:bg-[#45cab4]/25 transition-colors"
                >
                  <span>Brand: {brand}</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              {search && (
                <Link
                  href={createQueryString({ search: null, page: 1 })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#2b9685] bg-[#45cab4]/15 border border-[#45cab4]/30 rounded-full hover:bg-[#45cab4]/25 transition-colors"
                >
                  <span>Search: &quot;{search}&quot;</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              <Link
                href="/shop"
                className="text-xs text-red-500 hover:text-red-700 underline font-semibold ml-2"
              >
                Reset All
              </Link>
            </div>
          )}
        </div>

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="lg:col-span-1 space-y-6 hidden lg:block">
            {/* Categories List */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2b9685]" />
                Categories
              </h3>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-2 scrollbar-none text-xs">
                <Link
                  href={createQueryString({ category: null, page: 1 })}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                    !category
                      ? 'bg-[#45cab4] text-black font-bold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{total}</span>
                </Link>
                {categories.slice(0, 30).map((cat) => (
                  <Link
                    key={cat.id}
                    href={createQueryString({ category: cat.slug, page: 1 })}
                    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                      category === cat.slug
                        ? 'bg-[#45cab4] text-black font-bold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[11px] opacity-75 font-semibold">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2b9685]" />
                Top Brands
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href={createQueryString({ brand: null, page: 1 })}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                    !brand
                      ? 'bg-[#45cab4] text-black font-bold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>All Brands</span>
                </Link>
                {topBrands.slice(0, 10).map((b) => (
                  <Link
                    key={b.name}
                    href={createQueryString({ brand: b.name, page: 1 })}
                    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                      brand === b.name
                        ? 'bg-[#45cab4] text-black font-bold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[11px] opacity-75 font-semibold">{b.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
                Price in AUD
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  href={createQueryString({ minPrice: null, maxPrice: 30, page: 1 })}
                  className="block py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Under $30.00
                </Link>
                <Link
                  href={createQueryString({ minPrice: 30, maxPrice: 50, page: 1 })}
                  className="block py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  $30.00 – $50.00
                </Link>
                <Link
                  href={createQueryString({ minPrice: 50, maxPrice: 100, page: 1 })}
                  className="block py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  $50.00 – $100.00
                </Link>
                <Link
                  href={createQueryString({ minPrice: 100, maxPrice: null, page: 1 })}
                  className="block py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  $100.00+ (Cartons & Bundles)
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-8">
            {products.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                <p className="text-lg font-bold text-gray-900">No products found matching your criteria.</p>
                <p className="text-xs text-gray-500">Try adjusting your filters or search terms.</p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#45cab4] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#37b19d]"
                >
                  Reset Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-200">
                {currentPage > 1 ? (
                  <Link
                    href={createQueryString({ page: currentPage - 1 })}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                ) : (
                  <span className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed">
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                )}

                {/* Page number buttons */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={createQueryString({ page: pageNum })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#45cab4] text-black font-black shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={createQueryString({ page: currentPage + 1 })}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <span className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
