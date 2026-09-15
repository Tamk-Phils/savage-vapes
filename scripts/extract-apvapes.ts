import fs from 'fs';
import path from 'path';

interface ApvsPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

interface ApvsProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_minor_unit: number;
  };
  images: Array<{ id: number; src: string; alt?: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  is_in_stock: boolean;
  attributes?: Array<{ name: string; options: string[] }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, "'").replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim();
}

function calculateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function extractHeadings(content: string): Array<{ id: string; title: string; level: number }> {
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const headings: Array<{ id: string; title: string; level: number }> = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawTitle = stripHtml(match[2]);
    if (!rawTitle) continue;
    const id = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({ id, title: rawTitle, level: Number(match[1]) });
  }
  return headings;
}

function sanitizePostContent(content: string): string {
  let cleaned = content
    // Remove AP Vape Shop URLs and replace with internal shop links
    .replace(/https?:\/\/(www\.)?apvapeshop\.com\/products\/[a-z0-9-]+/gi, '/shop')
    .replace(/https?:\/\/(www\.)?apvapeshop\.com\/product\/[a-z0-9-]+/gi, '/shop')
    .replace(/https?:\/\/(www\.)?apvapeshop\.com\/collections\/[a-z0-9-]+/gi, '/shop?category=disposable-vapes')
    .replace(/https?:\/\/(www\.)?apvapeshop\.com\/[a-z0-9-]+-flavor-guide[a-z0-9-]*/gi, '/blog')
    .replace(/https?:\/\/(www\.)?apvapeshop\.com\/?/gi, '/')
    // Brand mentions
    .replace(/AP Vape Shop/gi, 'Vape Well Australia')
    .replace(/Apvs/gi, 'Vape Well')
    // US references to AU
    .replace(/United States/gi, 'Australia')
    .replace(/USPS/gi, 'Australia Post')
    .replace(/across the US/gi, 'across Australia')
    .replace(/nationwide in the US/gi, 'nationwide across Australia')
    // Clean empty paragraphs or style artifacts
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, '')
    .replace(/<span style="font-weight: 400;">(.*?)<\/span>/gi, '$1');

  return cleaned;
}

function sanitizeProductDescription(desc: string): string {
  return desc
    .replace(/https?:\/\/(www\.)?apvapeshop\.com[^\s"']*/gi, '/shop')
    .replace(/AP Vape Shop/gi, 'Vape Well Australia')
    .replace(/Apvs/gi, 'Vape Well')
    .replace(/United States/gi, 'Australia')
    .replace(/USPS/gi, 'Australia Post')
    .trim();
}

async function extractPosts() {
  console.log('📡 Fetching posts from apvapeshop.com...');
  const res = await fetch('https://apvapeshop.com/wp-json/wp/v2/posts?_embed=true&per_page=25');
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
  const rawPosts: ApvsPost[] = await res.json();
  console.log(`✅ Retrieved ${rawPosts.length} posts.`);

  const processedPosts = rawPosts.map((p, idx) => {
    const rawTitle = stripHtml(p.title.rendered);
    const rawExcerpt = stripHtml(p.excerpt.rendered);
    const cleanedContent = sanitizePostContent(p.content.rendered);
    const headings = extractHeadings(p.content.rendered);
    const readTime = calculateReadTime(cleanedContent);

    // Featured image
    let featuredImage = 'https://primevapesaustralia.com/wp-content/uploads/2026/06/vape-vaporizers-pod-system-pod-mod-wallpaper-preview.jpg';
    if (p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]?.source_url) {
      featuredImage = p._embedded['wp:featuredmedia'][0].source_url;
    }

    // Category determination
    const titleLower = rawTitle.toLowerCase();
    let category = 'Vape Guides';
    if (titleLower.includes('flavor') || titleLower.includes('taste')) {
      category = 'Flavor Reviews';
    } else if (titleLower.includes('review') || titleLower.includes('vs')) {
      category = 'Device Reviews';
    } else if (titleLower.includes('tank') || titleLower.includes('pod') || titleLower.includes('coil')) {
      category = 'Hardware & Pods';
    } else if (titleLower.includes('starter') || titleLower.includes('how to')) {
      category = 'Beginner Guides';
    }

    // SEO Meta
    const metaTitle = `${rawTitle} | Vape Well Australia Guides`;
    const metaDescription = rawExcerpt.slice(0, 155) + (rawExcerpt.length > 155 ? '...' : '');
    const keywords = [
      rawTitle.split(' ').slice(0, 3).join(' '),
      category,
      'Buy Vapes Online Australia',
      'Disposable Vapes Australia',
      'Vape Well Australia'
    ];

    return {
      id: p.id,
      slug: p.slug,
      title: rawTitle,
      excerpt: rawExcerpt,
      content: cleanedContent,
      featuredImage,
      category,
      author: {
        name: 'Vape Well Editorial Team',
        role: 'Vape Specialists & Reviewers',
        avatar: '/vape-well-avatar.png'
      },
      publishedAt: p.date.split('T')[0] || '2026-09-10',
      readTime,
      headings,
      isFeatured: idx < 3,
      metaTitle,
      metaDescription,
      keywords,
      tags: [category, 'Australia Vaping', 'Hardware Review']
    };
  });

  const postsFilePath = path.join(process.cwd(), 'data', 'posts.json');
  fs.writeFileSync(postsFilePath, JSON.stringify(processedPosts, null, 2), 'utf-8');
  console.log(`💾 Successfully saved ${processedPosts.length} SEO-optimized posts to ${postsFilePath}`);
}

async function extractProducts() {
  console.log('📡 Fetching products from apvapeshop.com store API...');
  // Fetch up to 100 curated, high-demand devices & kits
  const res = await fetch('https://apvapeshop.com/wp-json/wc/store/v1/products?per_page=100&page=1');
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  const rawProducts: ApvsProduct[] = await res.json();
  console.log(`✅ Retrieved ${rawProducts.length} products from apvapeshop.com.`);

  // Load existing products
  const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
  let existingProducts: any[] = [];
  if (fs.existsSync(productsFilePath)) {
    existingProducts = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    console.log(`📦 Existing products catalog size: ${existingProducts.length}`);
  }

  const existingIds = new Set(existingProducts.map((p) => String(p.id)));
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));

  let addedCount = 0;
  const newProcessedProducts: any[] = [];

  for (const p of rawProducts) {
    // Generate unique ID with ap- prefix or unique numeric namespace (300000 + p.id)
    const newId = 300000 + p.id;
    if (existingIds.has(String(newId)) || existingSlugs.has(p.slug)) {
      continue;
    }

    // Convert USD price to AUD (multiply by ~1.5)
    const minorUnit = p.prices.currency_minor_unit || 2;
    const rawPriceUsd = Number(p.prices.price || p.prices.regular_price || '2000') / Math.pow(10, minorUnit);
    const rawRegUsd = Number(p.prices.regular_price || p.prices.price || '2500') / Math.pow(10, minorUnit);

    const audPrice = Math.round(rawPriceUsd * 1.5 * 100) / 100;
    const audRegPrice = Math.max(audPrice, Math.round(rawRegUsd * 1.5 * 100) / 100);
    const audSalePrice = p.on_sale ? audPrice : null;

    // Determine clean brand
    const nameLower = p.name.toLowerCase();
    let brand = 'Vape Well';
    if (nameLower.includes('smok')) brand = 'SMOK';
    else if (nameLower.includes('geek bar') || nameLower.includes('geek vape')) brand = 'Geek Bar';
    else if (nameLower.includes('viho')) brand = 'Viho';
    else if (nameLower.includes('vaporesso')) brand = 'Vaporesso';
    else if (nameLower.includes('voopoo')) brand = 'VOOPOO';
    else if (nameLower.includes('uwell')) brand = 'Uwell';
    else if (nameLower.includes('juul')) brand = 'JUUL';
    else if (nameLower.includes('vgod')) brand = 'VGOD';
    else if (nameLower.includes('njoy')) brand = 'NJOY';
    else if (nameLower.includes('halo')) brand = 'Halo';
    else if (nameLower.includes('skwezed')) brand = 'Skwezed';

    // Format categories
    const categories: string[] = [];
    if (nameLower.includes('disposable') || nameLower.includes('puff')) {
      categories.push('Disposable Vapes');
    }
    if (nameLower.includes('kit') || nameLower.includes('starter') || nameLower.includes('mod')) {
      categories.push('Vape Kits');
    }
    if (nameLower.includes('pod')) {
      categories.push('Pod Systems');
    }
    if (nameLower.includes('tank') || nameLower.includes('coil')) {
      categories.push('Coils & Pods');
    }
    if (nameLower.includes('e-liquid') || nameLower.includes('juice')) {
      categories.push('E-Liquids');
    }
    if (categories.length === 0) {
      categories.push('Disposable Vapes');
    }
    categories.push(brand);

    // Format images
    const images = p.images?.length > 0
      ? p.images.map((img, idx) => ({
          id: idx + 1,
          src: img.src,
          thumbnail: img.src,
          alt: p.name,
        }))
      : [{ id: 1, src: '/placeholder-vape.jpg', thumbnail: '/placeholder-vape.jpg', alt: p.name }];

    // Cleaned descriptions
    const cleanedDesc = sanitizeProductDescription(p.description || p.short_description || p.name);
    const cleanedShort = stripHtml(p.short_description || p.name).slice(0, 160);

    const productObj = {
      id: newId,
      name: p.name,
      slug: p.slug,
      permalink: `/product/${p.slug}`,
      sku: `VW-AP-${p.id}`,
      short_description: cleanedShort,
      description: cleanedDesc,
      on_sale: p.on_sale,
      price: audPrice,
      regular_price: audRegPrice,
      sale_price: audSalePrice,
      is_in_stock: p.is_in_stock ?? true,
      images,
      categories: Array.from(new Set(categories)),
      tags: [brand, 'Authentic Hardware', 'Australia Post Express'],
      attributes: p.attributes || [],
      brand,
    };

    newProcessedProducts.push(productObj);
    existingIds.add(String(newId));
    existingSlugs.add(p.slug);
    addedCount++;
  }

  const mergedProducts = [...existingProducts, ...newProcessedProducts];
  fs.writeFileSync(productsFilePath, JSON.stringify(mergedProducts, null, 2), 'utf-8');
  console.log(`💾 Successfully merged ${addedCount} new products. Total catalog size: ${mergedProducts.length}`);
}

async function main() {
  try {
    await extractPosts();
    await extractProducts();
    console.log('🎉 Extraction and SEO localization complete!');
  } catch (err) {
    console.error('❌ Error during extraction:', err);
    process.exit(1);
  }
}

main();
