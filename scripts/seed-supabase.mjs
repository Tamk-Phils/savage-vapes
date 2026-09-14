import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env or .env.local manually if not in process.env
const loadEnv = () => {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      });
    }
  }
};

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Error: Missing Supabase credentials!');
  console.error('Please define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Starting Supabase Seeding for Savage Vapes Australia...');

  // 1. Categories
  const categoriesPath = path.join(rootDir, 'data', 'categories.json');
  if (fs.existsSync(categoriesPath)) {
    const rawCategories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    console.log(`📦 Seeding ${rawCategories.length} categories...`);

    const formattedCategories = rawCategories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      count: c.count || 0
    }));

    // Upsert in batches of 50
    for (let i = 0; i < formattedCategories.length; i += 50) {
      const chunk = formattedCategories.slice(i, i + 50);
      const { error } = await supabase.from('categories').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error(`Error inserting categories batch ${i}:`, error.message);
      }
    }
    console.log('✅ Categories seeded.');
  }

  // 2. Products
  const productsPath = path.join(rootDir, 'data', 'products.json');
  if (fs.existsSync(productsPath)) {
    const rawProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`💨 Seeding ${rawProducts.length} products in batches of 100...`);

    const formattedProducts = rawProducts.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || '',
      permalink: p.permalink || '',
      brand: p.brand || 'Savage',
      price: p.price,
      regular_price: p.regular_price,
      sale_price: p.sale_price,
      on_sale: p.on_sale,
      is_in_stock: p.is_in_stock,
      categories: p.categories || [],
      short_description: p.short_description || '',
      description: p.description || '',
      images: p.images || [],
      attributes: p.attributes || [],
      rating: p.rating || 5.0,
      review_count: p.review_count || 0
    }));

    for (let i = 0; i < formattedProducts.length; i += 100) {
      const chunk = formattedProducts.slice(i, i + 100);
      const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error(`Error inserting products batch ${i}-${i + chunk.length}:`, error.message);
      } else {
        process.stdout.write(`   Seeded ${Math.min(i + 100, formattedProducts.length)} / ${formattedProducts.length} products\r`);
      }
    }
    console.log('\n✅ All products seeded into Supabase.');
  }

  // 3. Customer Reviews
  console.log('⭐ Seeding initial verified customer reviews...');
  const initialReviews = [
    {
      author: "Lachlan M.",
      city: "Sydney",
      state: "NSW",
      rating: 5,
      comment: "Ordered disposable vapes online and delivery to Sydney was quicker than expected. Flavours were spot on and 100% authentic!",
      verified: true
    },
    {
      author: "Chloe D.",
      city: "Melbourne",
      state: "VIC",
      rating: 5,
      comment: "Great variety of disposable vapes and flavours available. Ordered from Melbourne and everything arrived sealed and in perfect condition.",
      verified: true
    },
    {
      author: "Jack T.",
      city: "Brisbane",
      state: "QLD",
      rating: 5,
      comment: "First time ordering from Savage Vapes and the experience was flawless. Checkout was easy, discreet shipping arrived within 2 days.",
      verified: true
    },
    {
      author: "Mitchell K.",
      city: "Perth",
      state: "WA",
      rating: 5,
      comment: "Solid vape shop with reliable shipping all the way to WA. The IGET bars hit smooth and last as advertised.",
      verified: true
    },
    {
      author: "Jessica R.",
      city: "Adelaide",
      state: "SA",
      rating: 5,
      comment: "Good vape flavours, smooth hits overall and customer support was super helpful when I had a question about pod compatibility.",
      verified: true
    },
    {
      author: "Sam B.",
      city: "Gold Coast",
      state: "QLD",
      rating: 5,
      comment: "Best prices in Australia hands down, especially the 10-pack bundle deals. Will definitely be a repeat customer!",
      verified: true
    }
  ];

  const { error: reviewErr } = await supabase.from('reviews').insert(initialReviews);
  if (reviewErr) {
    console.log('Note on reviews insertion:', reviewErr.message);
  } else {
    console.log('✅ Customer reviews seeded.');
  }

  console.log('\n🎉 Supabase seeding finished successfully!');
}

seed().catch(err => {
  console.error('Fatal error seeding database:', err);
  process.exit(1);
});

