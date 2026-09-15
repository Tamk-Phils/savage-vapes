import Link from 'next/link';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Vape Well Editorial Team';
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (featured) {
    return (
      <div className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
        <Link
          href={`/blog/${post.slug}`}
          className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-100 block"
        >
          <img
            src={post.featuredImage || '/placeholder-vape.jpg'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3.5 py-1.5 rounded-full bg-[#0d9488] text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Featured Guide
            </span>
          </div>
        </Link>

        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 text-[#0d9488] font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>

            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#0d9488] transition-colors line-clamp-2 font-display leading-tight">
                {post.title}
              </h2>
            </Link>

            <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              By {authorName}
            </span>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0d9488] hover:text-[#0f766e] group-hover:translate-x-1 transition-all"
            >
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all duration-300">
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 block"
      >
        <img
          src={post.featuredImage || '/placeholder-vape.jpg'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-slate-800 text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0d9488]" />
              {post.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="block">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0d9488] transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">
            {authorName}
          </span>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0d9488] group-hover:translate-x-0.5 transition-transform"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
