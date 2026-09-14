import fs from 'fs';
import path from 'path';
import { Product, ProductCategory, CustomerReview, Order } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const dataDir = path.join(process.cwd(), 'data');
const ordersFile = path.join(dataDir, 'orders.json');
const productsFile = path.join(dataDir, 'products.json');
const categoriesFile = path.join(dataDir, 'categories.json');

// Helper to safely read JSON
function readJSON<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  return fallback;
}

// Helper to safely write JSON
function writeJSON(file: string, data: any): boolean {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
    return false;
  }
}

// 1. ORDERS
export async function getAllOrders(): Promise<Order[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          customerName: d.customer_name,
          customerEmail: d.customer_email,
          customerPhone: d.customer_phone,
          shippingAddress: d.shipping_address,
          items: d.items,
          subtotal: Number(d.subtotal),
          shippingFee: Number(d.shipping_fee),
          total: Number(d.total),
          paymentMethod: d.payment_method,
          status: d.status,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('Supabase orders fetch failed, reading local:', e);
    }
  }

  return readJSON<Order[]>(ordersFile, []);
}

export async function updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): Promise<boolean> {
  let updated = false;

  // Update Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (e) {
      console.warn('Supabase order update failed:', e);
    }
  }

  // Update local file
  const orders = readJSON<any[]>(ordersFile, []);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    orders[idx].status = status;
    if (trackingNumber) {
      orders[idx].trackingNumber = trackingNumber;
    }
    writeJSON(ordersFile, orders);
    updated = true;
  }

  return updated;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (e) {}
  }

  const orders = readJSON<Order[]>(ordersFile, []);
  const filtered = orders.filter((o) => o.id !== orderId);
  writeJSON(ordersFile, filtered);
  return true;
}

// 2. PRODUCTS
export async function addProduct(product: Partial<Product>): Promise<Product> {
  const products = readJSON<Product[]>(productsFile, []);
  const newId = String(Date.now());
  const slug = (product.name || 'product')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  const newProduct: Product = {
    id: newId,
    name: product.name || 'New Product',
    slug: product.slug || slug,
    sku: product.sku || '',
    brand: product.brand || 'Savage',
    price: Number(product.price || 0),
    regular_price: Number(product.regular_price || product.price || 0),
    sale_price: product.sale_price ? Number(product.sale_price) : null,
    on_sale: Boolean(product.on_sale),
    is_in_stock: product.is_in_stock !== undefined ? product.is_in_stock : true,
    categories: product.categories || ['Disposable Vapes'],
    short_description: product.short_description || '',
    description: product.description || '',
    images: product.images || [
      { id: 1, src: '/placeholder-vape.jpg', thumbnail: '/placeholder-vape.jpg', alt: product.name || '' },
    ],
    attributes: product.attributes || [],
    rating: 5.0,
    review_count: 0,
  };

  products.unshift(newProduct);
  writeJSON(productsFile, products);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('products').insert([newProduct]);
    } catch (e) {
      console.warn('Supabase product insert failed:', e);
    }
  }

  return newProduct;
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
  const products = readJSON<Product[]>(productsFile, []);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;

  products[idx] = { ...products[idx], ...updates };
  writeJSON(productsFile, products);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('products').update(updates).eq('id', productId);
    } catch (e) {
      console.warn('Supabase product update failed:', e);
    }
  }

  return products[idx];
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const products = readJSON<Product[]>(productsFile, []);
  const filtered = products.filter((p) => p.id !== productId);
  writeJSON(productsFile, filtered);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.warn('Supabase product delete failed:', e);
    }
  }

  return true;
}

// 3. CATEGORIES
export async function addCategory(category: Partial<ProductCategory>): Promise<ProductCategory> {
  const categories = readJSON<ProductCategory[]>(categoriesFile, []);
  const newCat: ProductCategory = {
    id: Date.now(),
    name: category.name || 'New Category',
    slug: category.slug || (category.name || '').toLowerCase().replace(/\s+/g, '-'),
    count: 0,
    description: category.description || '',
  };
  categories.push(newCat);
  writeJSON(categoriesFile, categories);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('categories').insert([newCat]);
    } catch (e) {}
  }

  return newCat;
}

export async function deleteCategory(categoryId: number): Promise<boolean> {
  const categories = readJSON<ProductCategory[]>(categoriesFile, []);
  const filtered = categories.filter((c) => c.id !== categoryId);
  writeJSON(categoriesFile, filtered);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch (e) {}
  }

  return true;
}

// 4. ADMIN STATS
export async function getAdminStats() {
  const products = readJSON<Product[]>(productsFile, []);
  const orders = readJSON<any[]>(ordersFile, []);
  const categories = readJSON<ProductCategory[]>(categoriesFile, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const outOfStock = products.filter((p) => !p.is_in_stock).length;

  const statusBreakdown = {
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    pendingOrders,
    totalProducts: products.length,
    totalCategories: categories.length,
    outOfStock,
    statusBreakdown,
    recentOrders: orders.slice(0, 8),
  };
}

