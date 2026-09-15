import fs from 'fs';
import path from 'path';
import { BlogPost } from '@/types';

let cachedPosts: BlogPost[] | null = null;

export function loadPosts(): BlogPost[] {
  if (cachedPosts && cachedPosts.length > 0) {
    return cachedPosts;
  }

  try {
    const postsPath = path.join(process.cwd(), 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const fileData = fs.readFileSync(postsPath, 'utf-8');
      cachedPosts = JSON.parse(fileData);
    } else {
      cachedPosts = [];
    }
  } catch (err) {
    console.error('Failed to load posts from data/posts.json:', err);
    cachedPosts = [];
  }

  return cachedPosts || [];
}

export function getAllPosts(options?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
} {
  const all = loadPosts();
  let filtered = [...all];

  if (options?.category && options.category !== 'all') {
    const targetCategory = options.category.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().trim() === targetCategory ||
        p.tags.some((t) => t.toLowerCase() === targetCategory)
    );
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  const page = options?.page || 1;
  const limit = options?.limit || 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    posts: paginated,
    total,
    page,
    totalPages,
  };
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = loadPosts();
  return posts.find((p) => p.slug === slug);
}

export function getFeaturedPosts(limit = 4): BlogPost[] {
  const posts = loadPosts();
  const featured = posts.filter((p) => p.isFeatured);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }
  // Fill with latest
  const remaining = posts.filter((p) => !p.isFeatured);
  return [...featured, ...remaining].slice(0, limit);
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  const posts = loadPosts();
  const targetCategory = category.toLowerCase().trim();

  // First priority: same category, excluding current post
  const sameCat = posts.filter(
    (p) => p.slug !== currentSlug && p.category.toLowerCase().trim() === targetCategory
  );

  if (sameCat.length >= limit) {
    return sameCat.slice(0, limit);
  }

  // Second priority: other posts
  const others = posts.filter(
    (p) => p.slug !== currentSlug && p.category.toLowerCase().trim() !== targetCategory
  );

  return [...sameCat, ...others].slice(0, limit);
}

export function getPostCategories(): { name: string; count: number }[] {
  const posts = loadPosts();
  const map = new Map<string, number>();

  posts.forEach((p) => {
    const cat = p.category.trim();
    if (cat) {
      map.set(cat, (map.get(cat) || 0) + 1);
    }
  });

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

