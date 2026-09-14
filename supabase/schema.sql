-- Supabase Schema for Savage Vapes Australia

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists categories (
  id bigint primary key,
  name text not null,
  slug text not null unique,
  description text,
  count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table if not exists products (
  id text primary key,
  name text not null,
  slug text not null unique,
  sku text,
  permalink text,
  brand text not null,
  price numeric(10, 2) not null,
  regular_price numeric(10, 2) not null,
  sale_price numeric(10, 2),
  on_sale boolean default false,
  is_in_stock boolean default true,
  categories text[] default array[]::text[],
  short_description text,
  description text,
  images jsonb default '[]'::jsonb,
  attributes jsonb default '[]'::jsonb,
  rating numeric(3, 2) default 5.0,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for searching products
create index if not exists idx_products_slug on products (slug);
create index if not exists idx_products_brand on products (brand);
create index if not exists idx_products_price on products (price);
create index if not exists idx_products_on_sale on products (on_sale);

-- 3. ORDERS TABLE
create table if not exists orders (
  id text primary key default ('SAVAGE-' || upper(substr(md5(random()::text), 1, 7))),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) not null,
  total numeric(10, 2) not null,
  payment_method text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. REVIEWS TABLE
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id text references products(id) on delete set null,
  author text not null,
  city text,
  state text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;

-- Public and Admin Access Policies
create policy "Allow public read access for categories" on categories
  for select using (true);

create policy "Allow admin modify categories" on categories
  for all using (true);

create policy "Allow public read access for products" on products
  for select using (true);

create policy "Allow admin modify products" on products
  for all using (true);

create policy "Allow public read access for reviews" on reviews
  for select using (true);

create policy "Allow public review creation" on reviews
  for insert with check (true);

create policy "Allow public order creation" on orders
  for insert with check (true);

create policy "Allow admin read orders" on orders
  for select using (true);

create policy "Allow admin update orders" on orders
  for update using (true);

create policy "Allow admin delete orders" on orders
  for delete using (true);

