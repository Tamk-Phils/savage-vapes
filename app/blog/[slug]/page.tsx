import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Clock, 
  Calendar, 
  ChevronRight, 
  User, 
  Bookmark, 
  Share2, 
  ShieldCheck, 
  Truck, 
  ArrowLeft,
  Flame,
  ListOrdered
} from 'lucide-react';
import { getPostBySlug, getRelatedPosts, loadPosts } from '@/lib/posts';
import BlogCard from '@/components/BlogCard';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = loadPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Vape Well Australia',
    };
  }

  const url = `https://vapewellaustralia.com/blog/${post.slug}`;

  return {
    title: `${post.metaTitle || post.title} | Vape Well Australia`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', '),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [typeof post.author === 'string' ? post.author : post.author?.name || 'Vape Well Editorial Team'],
      images: [
        {
          url: post.featuredImage || '/placeholder-vape.jpg',
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.featuredImage || '/placeholder-vape.jpg'],
    },
  };
}

function attachHeadingIds(html: string): string {
  return html.replace(/<(h[23])(.*?)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    const id = cleanText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<${tag} id="${id}" ${attrs}>${text}</${tag}>`;
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category, 3);
  const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Vape Well Editorial Team';
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const contentWithIds = attachHeadingIds(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: [post.featuredImage || 'https://vapewellaustralia.com/placeholder-vape.jpg'],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vape Well Australia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vapewellaustralia.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://vapewellaustralia.com/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#0d9488] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/blog" className="hover:text-[#0d9488] transition-colors">
              Vape Guides
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500 font-medium">{post.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
              {post.title}
            </span>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-teal-50 text-[#0d9488] font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-[#0d9488]" />
              {post.readTime}
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>
                By <strong className="text-slate-800">{authorName}</strong>
              </span>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d9488] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all guides
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Banner Image */}
      {post.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="relative aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 shadow-md">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Grid Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-8">
            {/* 18+ Advisory Note */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold uppercase tracking-wider block mb-1">
                Adult Information Notice (18+ Only)
              </strong>
              This guide is created solely for adult existing vapers and smokers in Australia looking for device benchmarks and technical information. Vaping products contain nicotine, an addictive substance.
            </div>

            {/* Rendered Article Body */}
            <div
              className="prose prose-slate max-w-none 
                prose-headings:font-display prose-headings:text-slate-900 prose-headings:font-bold prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base
                prose-a:text-[#0d9488] prose-a:font-semibold hover:prose-a:underline
                prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-700 prose-li:my-1
                prose-table:w-full prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-3 prose-td:p-3 prose-td:border-b prose-td:border-slate-100"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Tags Strip */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Topics:
                </span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-[#0d9488] text-xs font-medium text-slate-600 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Inline Product Promotion CTA */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-[#0d9488] text-white p-6 sm:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Vape Well Australia Catalog
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-display">
                Looking for Authentic Vaping Hardware?
              </h3>
              <p className="text-sm text-teal-50 leading-relaxed">
                Explore our full line-up of verified devices, replacement pods, and accessories with express, discreet delivery across Australia.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all shadow-sm"
                >
                  Shop Now
                </Link>
                <Link
                  href="/shop?category=disposable-vapes"
                  className="px-6 py-2.5 rounded-full bg-teal-700/60 hover:bg-teal-700 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  Disposables
                </Link>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Table of Contents */}
            {post.headings && post.headings.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
                  <ListOrdered className="w-4 h-4 text-[#0d9488]" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-1.5 text-xs">
                  {post.headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block py-1 text-slate-600 hover:text-[#0d9488] hover:translate-x-1 transition-all leading-snug ${
                        h.level === 3 ? 'pl-4 text-[11px] text-slate-500' : 'font-medium'
                      }`}
                    >
                      {h.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Delivery Guarantee Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                <span>The Vape Well Guarantee</span>
              </div>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                  <span>Express Australia Post tracked dispatch with signature on delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                  <span>100% Genuine, batch-verified authentic hardware directly sourced.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                  <span>Dead on arrival (DOA) replacement guarantee on all hardware.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href="/shop"
                  className="block w-full py-2.5 text-center rounded-xl bg-[#0d9488] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0f766e] transition-colors"
                >
                  Browse Hardware
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d9488] block">
                  Keep Reading
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-display">
                  Related Guides & Reviews
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#0d9488] hover:underline"
              >
                View all guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
