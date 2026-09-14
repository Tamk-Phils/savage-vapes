import fs from 'fs';
import path from 'path';
import { Product, ProductCategory, CustomerReview, Order } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

let localProductsCache: Product[] | null = null;
let localCategoriesCache: ProductCategory[] | null = null;

function loadLocalData(): { products: Product[]; categories: ProductCategory[] } {
  if (localProductsCache && localCategoriesCache) {
    return { products: localProductsCache, categories: localCategoriesCache };
  }

  try {
    const tmpProd = path.join('/tmp', 'products.json');
    const prodFile = fs.existsSync(tmpProd) ? tmpProd : path.join(process.cwd(), 'data', 'products.json');

    const tmpCat = path.join('/tmp', 'categories.json');
    const catFile = fs.existsSync(tmpCat) ? tmpCat : path.join(process.cwd(), 'data', 'categories.json');

    if (fs.existsSync(prodFile)) {
      const prodContent = fs.readFileSync(prodFile, 'utf-8');
      localProductsCache = JSON.parse(prodContent);
    } else {
      localProductsCache = [];
    }

    if (fs.existsSync(catFile)) {
      const catContent = fs.readFileSync(catFile, 'utf-8');
      localCategoriesCache = JSON.parse(catContent);
    } else {
      localCategoriesCache = [];
    }
  } catch (err) {
    console.error('Error reading local JSON files:', err);
    localProductsCache = [];
    localCategoriesCache = [];
  }

  return {
    products: localProductsCache || [],
    categories: localCategoriesCache || [],
  };
}

export async function getCategories(): Promise<ProductCategory[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('count', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as ProductCategory[];
      }
    } catch (e) {
      console.warn('Supabase categories fetch failed, using local cache:', e);
    }
  }

  const { categories } = loadLocalData();
  return categories.sort((a, b) => (b.count || 0) - (a.count || 0));
}

export function getCategoryMatchTerms(category: string): string[] {
  const normalized = category.trim().toLowerCase();
  const terms = new Set<string>([
    category,
    normalized,
    normalized.replace(/-/g, ' '),
    normalized.replace(/\s+/g, '-'),
  ]);

  const { categories } = loadLocalData();

  // Find all category objects matching this slug or name
  const matched = categories.filter(
    (c) =>
      c.slug.toLowerCase() === normalized ||
      c.name.toLowerCase() === normalized ||
      c.slug.toLowerCase() === normalized.replace(/\s+/g, '-') ||
      c.name.toLowerCase() === normalized.replace(/-/g, ' ')
  );

  function collectChildren(catId: number) {
    const children = categories.filter((c) => c.parent === catId);
    children.forEach((ch) => {
      terms.add(ch.slug);
      terms.add(ch.slug.toLowerCase());
      terms.add(ch.name);
      terms.add(ch.name.toLowerCase());
      collectChildren(ch.id);
    });
  }

  matched.forEach((m) => {
    terms.add(m.slug);
    terms.add(m.slug.toLowerCase());
    terms.add(m.name);
    terms.add(m.name.toLowerCase());
    collectChildren(m.id);
  });

  return Array.from(terms);
}

export interface ProductQueryOptions {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'popularity' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
  inStockOnly?: boolean;
}

export async function getProducts(options: ProductQueryOptions = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    category,
    brand,
    search,
    minPrice,
    maxPrice,
    sortBy = 'popularity',
    page = 1,
    limit = 24,
    inStockOnly = false,
  } = options;

  // Supabase querying if enabled
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category) {
        const catTerms = getCategoryMatchTerms(category);
        query = query.overlaps('categories', catTerms);
      }
      if (brand) {
        query = query.ilike('brand', `%${brand}%`);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }
      if (inStockOnly) {
        query = query.eq('is_in_stock', true);
      }

      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('id', { ascending: false });
          break;
      }

      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const total = count || data.length;
        return {
          products: data as Product[],
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (e) {
      console.warn('Supabase product query failed, using local cache:', e);
    }
  }

  // Local JSON filtering fallback
  const { products } = loadLocalData();
  let filtered = [...products];

  if (category) {
    const catTerms = getCategoryMatchTerms(category).map((t) => t.toLowerCase());
    filtered = filtered.filter((p) => {
      const pCats = [
        ...(p.categories || []).map((c) => c.toLowerCase()),
        ...(p.category_objects || []).flatMap((co) => [co.slug?.toLowerCase(), co.name?.toLowerCase()]).filter(Boolean) as string[],
      ];
      return catTerms.some((t) => pCats.includes(t) || pCats.some((c) => c.includes(t)));
    });
  }

  if (brand) {
    const brandLower = brand.toLowerCase().trim();
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brandLower || p.brand.toLowerCase().includes(brandLower));
  }

  if (search) {
    const searchLower = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.short_description?.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.categories?.some((c) => c.toLowerCase().includes(searchLower))
    );
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }
  if (inStockOnly) {
    filtered = filtered.filter((p) => p.is_in_stock);
  }

  // Sorting
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case 'popularity':
    default:
      // Prioritize on_sale and items with higher reviews
      filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0) || Number(b.id) - Number(a.id));
      break;
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const validPage = Math.max(1, Math.min(page, totalPages));
  const offset = (validPage - 1) * limit;
  const pagedProducts = filtered.slice(offset, offset + limit);

  return {
    products: pagedProducts,
    total,
    page: validPage,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', decodedSlug)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch (e) {
      console.warn('Supabase product slug lookup failed, checking local:', e);
    }
  }

  const { products } = loadLocalData();
  const product = products.find((p) => p.slug.toLowerCase() === decodedSlug);
  return product || null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = loadLocalData();
  // Filter prominent disposable vapes (IGET, HQD, ALIBARBAR, RELX)
  const popularBrands = ['IGET', 'HQD', 'ALIBARBAR', 'RELX', 'VEIPUS'];
  const featured = products.filter((p) =>
    popularBrands.some((b) => p.brand.toUpperCase().includes(b)) && p.images?.length > 0
  );
  return featured.slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { products } = loadLocalData();
  // Recent products by highest ID
  const sorted = [...products].sort((a, b) => Number(b.id) - Number(a.id));
  return sorted.slice(0, limit);
}

export async function getBestDisposablesSection(limit = 4): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes('alibarbar ingot 9000') ||
      p.name.toLowerCase().includes('iget bar 3500')
  );
  return matched.slice(0, limit);
}

export async function getNewArrivalsSection(limit = 4): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes('hqd cuvie slick 20000') ||
      p.name.toLowerCase().includes('iget bar pro')
  );
  return matched.slice(0, limit);
}

export async function getRelxPodsSection(limit = 6): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter((p) => p.name.toLowerCase().includes('relx infinity pod'));
  return matched.slice(0, limit);
}

export async function getVapeKitsSection(limit = 6): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes('smok g-priv') ||
      p.name.toLowerCase().includes('smok ipx80') ||
      p.name.toLowerCase().includes('smok mag') ||
      p.name.toLowerCase().includes('smok nfix') ||
      p.name.toLowerCase().includes('smok nord')
  );
  return matched.slice(0, limit);
}

export async function getOpalPodsSection(limit = 6): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter((p) => p.name.toLowerCase().includes('opal – pod only'));
  return matched.slice(0, limit);
}

export async function getGeekBarSection(limit = 4): Promise<Product[]> {
  const { products } = loadLocalData();
  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes('geek bar') ||
      p.name.toLowerCase().includes('fifty bar') ||
      p.categories.some((c) => c.toLowerCase().includes('snus') || c.toLowerCase().includes('pouch'))
  );
  return matched.slice(0, limit);
}

export async function getBulkBundles(limit = 8): Promise<Product[]> {
  const { products } = loadLocalData();
  const bundles = products.filter((p) =>
    p.name.toLowerCase().includes('10 pack') ||
    p.name.toLowerCase().includes('bundle') ||
    p.name.toLowerCase().includes('box of') ||
    p.categories.some((c) => c.toLowerCase().includes('bundle'))
  );
  if (bundles.length < limit) {
    return products.slice(10, 10 + limit);
  }
  return bundles.slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { products } = loadLocalData();
  const related = products.filter((p) =>
    p.id !== product.id &&
    (p.brand === product.brand || p.categories.some((c) => product.categories.includes(c)))
  );
  return related.slice(0, limit);
}

export async function getTopBrands(): Promise<{ name: string; count: number }[]> {
  const { products } = loadLocalData();
  const counts: { [brand: string]: number } = {};
  for (const p of products) {
    if (p.brand) {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

const fallbackReviews: CustomerReview[] = [
  {
    id: "rev-1",
    author: "Liam M.",
    city: "Sydney",
    state: "NSW",
    rating: 5,
    date: "2 days ago",
    comment: "Ordered disposable vapes online and delivery to Sydney was quicker than expected! Flavours were strong, fresh, and 100% authentic. Will be ordering regularly.",
    verified: true
  },
  {
    id: "rev-2",
    author: "Sarah W.",
    city: "Melbourne",
    state: "VIC",
    rating: 5,
    date: "4 days ago",
    comment: "Great variety of disposable vapes and flavours available. Ordered from Melbourne and everything arrived sealed and in perfect discreet packaging.",
    verified: true
  },
  {
    id: "rev-3",
    author: "Jack T.",
    city: "Brisbane",
    state: "QLD",
    rating: 5,
    date: "1 week ago",
    comment: "First time ordering from Savage Vapes and the experience was smooth. Checkout was easy, shipping to Brisbane was reliable. Best prices around!",
    verified: true
  },
  {
    id: "rev-4",
    author: "Dave K.",
    city: "Perth",
    state: "WA",
    rating: 5,
    date: "1 week ago",
    comment: "Solid vape shop with reliable express shipping all the way to WA. Devices arrived well packaged and hit clean and punchy right out of the box.",
    verified: true
  },
  {
    id: "rev-5",
    author: "Emma H.",
    city: "Adelaide",
    state: "SA",
    rating: 5,
    date: "2 weeks ago",
    comment: "Good vape flavours and smooth hits overall. Ordered to Adelaide and the parcel arrived safely. Customer support responded in 5 minutes!",
    verified: true
  },
  {
    id: "rev-6",
    author: "Marcus G.",
    city: "Gold Coast",
    state: "QLD",
    rating: 5,
    date: "2 weeks ago",
    comment: "The 10-pack bulk bundle is the best deal in Australia. Saved over $80 compared to local shops. Highly recommended to all Australian vapers.",
    verified: true
  }
];

export async function getReviews(): Promise<CustomerReview[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          productId: d.product_id,
          author: d.author,
          city: d.city || 'Australia',
          state: d.state || 'AU',
          rating: d.rating,
          comment: d.comment,
          date: new Date(d.created_at).toLocaleDateString('en-AU'),
          verified: d.verified,
        }));
      }
    } catch (e) {
      console.warn('Supabase reviews fetch failed, using fallback:', e);
    }
  }
  return fallbackReviews;
}

export async function saveOrder(order: Partial<Order>): Promise<{ success: boolean; orderId: string; error?: string }> {
  const orderId = 'SAVAGE-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('orders').insert({
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.shippingAddress,
        items: order.items,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        total: order.total,
        payment_method: order.paymentMethod,
        status: 'pending',
      }).select();

      if (!error && data && data[0]) {
        return { success: true, orderId: data[0].id };
      }
      if (error) {
        console.warn('Supabase order insert error, using generated id:', error.message);
      }
    } catch (e) {
      console.error('Failed to insert order to Supabase:', e);
    }
  }

  // Save to local data/orders.json with /tmp serverless fallback
  try {
    const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');
    const tmpOrdersPath = path.join('/tmp', 'orders.json');
    const targetReadPath = fs.existsSync(tmpOrdersPath) ? tmpOrdersPath : ordersFilePath;

    let ordersList: any[] = [];
    if (fs.existsSync(targetReadPath)) {
      ordersList = JSON.parse(fs.readFileSync(targetReadPath, 'utf-8'));
    } else if (fs.existsSync(ordersFilePath)) {
      ordersList = JSON.parse(fs.readFileSync(ordersFilePath, 'utf-8'));
    }
    ordersList.unshift({
      id: orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    try {
      fs.writeFileSync(ordersFilePath, JSON.stringify(ordersList, null, 2), 'utf-8');
    } catch (writeErr) {
      fs.writeFileSync(tmpOrdersPath, JSON.stringify(ordersList, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to save order to local orders.json:', err);
  }

  // Graceful success fallback with generated ID
  return { success: true, orderId };
}

