import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  AlertTriangle,
  ChevronRight 
} from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import ProductGallery from '@/components/ProductGallery';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4);
  const displayPrice = product.on_sale && product.sale_price ? product.sale_price : product.price;

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#2b9685] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#2b9685] transition-colors">Shop</Link>
          {product.categories?.[0] && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(product.categories[0].toLowerCase().replace(/\s+/g, '-'))}`}
                className="hover:text-[#2b9685] transition-colors capitalize"
              >
                {product.categories[0]}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{product.name}</span>
        </nav>

        {/* Product Hero: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between gap-4">
              <Link
                href={`/shop?brand=${encodeURIComponent(product.brand)}`}
                className="text-xs font-bold uppercase tracking-wider text-[#2b9685] hover:underline"
              >
                Brand: {product.brand}
              </Link>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock – Dispatched within 24hrs
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 font-display leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Social Proof */}
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-900">5.0</span>
              <span className="text-xs text-gray-500">
                ({product.review_count > 0 ? product.review_count : '38'} customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-baseline justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 font-display">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-gray-500">AUD</span>
                  {product.on_sale && product.regular_price > displayPrice && (
                    <span className="text-base text-gray-400 line-through ml-2">
                      ${product.regular_price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {product.on_sale && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-black bg-[#45cab4] rounded-full">
                  Save ${(product.regular_price - displayPrice).toFixed(2)} AUD
                </span>
              )}
            </div>

            {/* Short Description if available */}
            {product.short_description && (
              <div
                className="text-sm text-gray-600 leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Interactive Quantity and Add to Cart Form */}
            <ProductActions product={product} />

            {/* Quick Guarantees Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <ShieldCheck className="w-5 h-5 text-[#2b9685] mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-900 block">100% Authentic</span>
                <span className="text-[10px] text-gray-500">Verified Stock</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <Truck className="w-5 h-5 text-[#2b9685] mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-900 block">Discreet Express</span>
                <span className="text-[10px] text-gray-500">Plain Box Shipping</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                <RotateCcw className="w-5 h-5 text-[#2b9685] mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-900 block">DOA Guarantee</span>
                <span className="text-[10px] text-gray-500">Defect Replacement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Full Description & Specifications */}
        <div className="mt-16 pt-10 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display border-b border-gray-100 pb-4">
                Product Overview & Description
              </h2>

              {product.description ? (
                <div
                  className="text-sm text-gray-700 leading-relaxed space-y-4 max-w-none [&_p]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#2b9685] [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-sm text-gray-700">
                  {product.name} delivers an outstanding vaping experience with premium build quality, reliable heating elements, and consistent vapour production from start to finish.
                </p>
              )}
            </div>

            {/* Compliance Warning Box */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="text-amber-950 font-bold uppercase tracking-wider block">
                  Safety Warning & Age Restriction:
                </strong>
                <p>
                  This product is strictly for adult users aged 18 and older. Keep out of reach of children and pets. Do not use if pregnant, nursing, or suffering from cardiovascular or respiratory illnesses.
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
                Quick Specifications
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-bold text-gray-900">{product.brand}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-bold text-gray-900 capitalize">{product.categories[0] || 'Vape'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Availability</span>
                  <span className="font-bold text-emerald-700">In Stock</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-bold text-gray-900">Australia Post Express</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Packaging</span>
                  <span className="font-bold text-gray-900">Plain & Discreet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display">
                Customers Also Bought
              </h2>
              <Link
                href="/shop"
                className="text-xs font-bold uppercase tracking-wider text-[#2b9685] hover:underline"
              >
                View More →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
