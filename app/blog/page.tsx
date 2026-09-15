import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search, Sparkles, Flame, ChevronRight, Tag } from 'lucide-react';
import { getAllPosts, getFeaturedPosts, getPostCategories } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'Vape Guides, Reviews & Flavor Insights | Vape Well Australia',
  description:
    'Comprehensive Australian vaping guides, hardware reviews, flavor breakdowns, and beginner tips. Stay informed with verified insights for Sydney, Melbourne, Brisbane & nationwide.',
  alternates: {
    canonical: 'https://vapewellaustralia.com/blog',
  },
  openGraph: {
    title: 'Vape Guides & Flavor Reviews | Vape Well Australia',
    description:
      'Comprehensive Australian vaping guides, hardware reviews, flavor breakdowns, and beginner tips.',
    url: 'https://vapewellaustralia.com/blog',
    siteName: 'Vape Well Australia',
    type: 'website',
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'all';
  const searchQuery = params.search || '';
  const currentPage = Number(params.page) || 1;

  const limit = 12;
  const { posts, total, totalPages } = getAllPosts({
    category: currentCategory,
    search: searchQuery,
    page: currentPage,
    limit,
  });

  const categories = getPostCategories();
  const featuredPost = currentPage === 1 && !searchQuery && currentCategory === 'all'
    ? getFeaturedPosts(1)[0]
    : null;

  // Filter out the featured post from the grid if displayed in hero
  const gridPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
            <Link href="/" className="hover:text-[#0d9488] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Vape Guides & Insights</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#0d9488] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Vape Well Knowledge Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 font-display tracking-tight">
              Vape Guides, Reviews & Industry Insights
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Explore in-depth device breakdowns, puff-count benchmarks, detailed flavor profiles, and essential hardware tips curated specifically for Australian adult vapers.
            </p>
          </div>

          {/* Search Bar & Category Filter Strip */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <form method="GET" action="/blog" className="relative flex-1 max-w-md">
              {currentCategory !== 'all' && (
                <input type="hidden" name="category" value={currentCategory} />
              )}
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search guides, devices, flavors..."
                className="w-full bg-slate-50 text-slate-900 text-sm rounded-full pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-[#0d9488] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Quick Stats */}
            <div className="text-xs text-slate-500 font-semibold flex items-center gap-4">
              <span>{total} Total Articles Published</span>
              <span>•</span>
              <span className="text-[#0d9488]">100% Free Resources</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href={searchQuery ? `/blog?search=${encodeURIComponent(searchQuery)}` : '/blog'}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                currentCategory === 'all'
                  ? 'bg-[#0d9488] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Topics ({total})
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog?category=${encodeURIComponent(cat.name)}${
                  searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
                }`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  currentCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#0d9488] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Spotlight */}
        {featuredPost && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-[#0d9488]" />
              <span>Editor&apos;s Highlight</span>
            </div>
            <BlogCard post={featuredPost} featured={true} />
          </section>
        )}

        {/* Articles Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              {currentCategory !== 'all' ? `${currentCategory} Guides` : 'Latest Articles'}
            </h2>
            <span className="text-xs text-slate-500">
              Showing {gridPosts.length} of {total} articles
            </span>
          </div>

          {gridPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No articles found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                We couldn&apos;t find any articles matching your search criteria. Try a different query or browse all categories.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0f766e] transition-colors"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const url = new URLSearchParams();
                if (currentCategory !== 'all') url.set('category', currentCategory);
                if (searchQuery) url.set('search', searchQuery);
                url.set('page', p.toString());

                return (
                  <Link
                    key={p}
                    href={`/blog?${url.toString()}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      p === currentPage
                        ? 'bg-[#0d9488] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Catalog CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#45cab4] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>Explore Authentic Hardware</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-display">
              Ready to Upgrade Your Vaping Experience?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Browse our complete catalog of over 2,100 verified devices, pods, and accessories with express, discreet dispatch across all Australian states and territories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#45cab4] hover:bg-white text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md"
            >
              Shop All Vapes
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider text-center transition-all"
            >
              Why Vape Well?
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
