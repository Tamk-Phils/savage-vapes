'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Tag, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BlogPost } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts?page=${p}&limit=12&search=${encodeURIComponent(s)}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, search);
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchPosts(page, search);
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#0d9488]" />
            Blog & SEO Vape Guides
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage educational articles, hardware tear-downs, and flavor reviews indexed by Google and Bing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>View Public Blog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides by title, category, keywords..."
            className="w-full bg-gray-50 text-xs text-gray-900 placeholder-gray-400 rounded-xl pl-9 pr-4 py-2 border border-gray-200 focus:border-[#0d9488] focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-800">{posts.length}</span> of{' '}
          <span className="font-bold text-gray-800">{total}</span> published articles
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" text="Loading blog articles..." />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No articles match your search</h3>
          <p className="text-xs text-gray-500">Try adjusting your keywords.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={post.featuredImage || '/placeholder-vape.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0d9488] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      {post.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold uppercase tracking-wider text-[10px]">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#0d9488] transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-1 max-w-2xl">
                      {post.excerpt}
                    </p>

                    <div className="text-[11px] text-gray-400">
                      Author: <span className="text-gray-600 font-medium">{typeof post.author === 'string' ? post.author : post.author?.name || 'Vape Well Team'}</span> • Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono text-[10px]">/blog/{post.slug}</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488] text-xs font-semibold text-gray-700 transition-colors"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
