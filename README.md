# Savage Vapes Australia 💨

A modern, high-performance e-commerce website built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Modelled directly after the client reference store (`https://primevapesaustralia.com`) with full brand customization, automated product extraction, real-time live search, slide-out cart drawer, and complete Australian checkout workflow.

---

## 🌟 Key Features

- **Extracted Catalog**: 2,072+ authentic products and 89 categories extracted from `primevapesaustralia.com` including IGET, HQD, ALIBARBAR, VEIPUS OPAL, RELX, SMOK, and Uwell.
- **Dual-Mode Data Architecture**: Works seamlessly out of the box with the included offline-ready JSON database (`data/products.json`), and automatically switches to Supabase PostgreSQL when credentials are provided.
- **Australian Regulatory Compliance**:
  - 18+ Age Verification Modal with localStorage persistence.
  - Prominent nicotine warning banner across the footer and product pages.
  - Australian address formatting (NSW, VIC, QLD, WA, SA, TAS, ACT, NT) and Australia Post discreet shipping calculations.
- **E-Commerce Suite**:
  - **Live Search**: Debounced instant search bar with visual thumbnails and real-time dropdown.
  - **Slide-out Cart Drawer**: Animated mini-cart with quantity adjustments and a $150 AUD free shipping progress bar.
  - **Catalog & Filters**: Filter by 89 categories, brands, price tiers, and sort by popularity, rating, or price.
  - **Product Detail Pages**: Multi-image thumbnail switcher, specifications table, stock availability badge, flavor selectors, and related recommendations.
  - **Full Cart & Checkout**: Coupon code support (`SAVAGE10`), PayID / Bank Transfer, Card, and Crypto payment methods.
  - **Verified Customer Reviews**: Community testimonials across major Australian capital cities and interactive review submission modal.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Supabase Setup & Product Sync

The project is already preloaded with all 2,072 extracted products in `data/products.json` so you can browse, search, and test orders immediately without requiring an account.

When you're ready to connect your live Supabase database:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Run the SQL schema in your Supabase SQL Editor:
   Copy the contents of `supabase/schema.sql` and run it in the Supabase Dashboard.
4. Seed all categories, products, and reviews:
   ```bash
   npm run db:seed
   ```

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with Header, Footer, CartDrawer, Age Gate
│   ├── page.tsx                # Homepage (Hero, Bestsellers, Categories, SEO, Reviews, FAQs)
│   ├── shop/page.tsx           # Full catalog with sidebar filters, sorting & pagination
│   ├── product/[slug]/page.tsx # Single product detail view with gallery and specs
│   ├── cart/page.tsx           # Shopping cart page with shipping threshold meter
│   ├── checkout/page.tsx       # Australian checkout page with order placement
│   ├── order-success/page.tsx  # Confirmation screen with order reference
│   ├── about/page.tsx          # About Savage Vapes Australia
│   ├── reviews/page.tsx        # Customer testimonials & review submission
│   └── api/
│       ├── products/route.ts   # Product search & filtering API
│       └── orders/route.ts     # Order placement API
├── components/
│   ├── Header.tsx              # Header with logo, instant search dropdown & cart badge
│   ├── Footer.tsx              # Australian legal warning, contact & navigation
│   ├── AgeVerificationModal.tsx# 18+ Australian compliance gate
│   ├── ProductCard.tsx         # Product grid card with hover effects & quick-add
│   ├── CartDrawer.tsx          # Slide-out mini-cart drawer
│   ├── ProductGallery.tsx      # Multi-thumbnail image viewer
│   ├── ProductActions.tsx      # Quantity, flavor selection & add-to-cart
│   ├── SortSelect.tsx          # Client-side sort dropdown
│   └── TrustBadges.tsx         # 4 value proposition badges
├── data/
│   ├── products.json           # 2,072 extracted products
│   └── categories.json         # 89 extracted categories
├── lib/
│   ├── cart-context.tsx        # Persistent shopping cart state
│   ├── products.ts             # Data layer supporting Supabase & local cache
│   └── supabase.ts             # Supabase client initializer
├── scripts/
│   ├── extract-products.py     # Product extractor from reference store
│   ├── seed-supabase.mjs       # Batch seeder for Supabase
│   └── test-site.sh            # Automated verification test script
├── supabase/
│   └── schema.sql              # PostgreSQL schema with RLS policies
└── types/
    └── index.ts                # TypeScript interfaces
```

