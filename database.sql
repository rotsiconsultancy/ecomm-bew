-- =============================================
-- BEWAMA DATABASE SCHEMA
-- =============================================

-- PROFILES (extends auth.users)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  role         text not null default 'customer'
                 check (role in ('admin', 'staff', 'wholesale', 'customer')),
  created_at   timestamptz not null default now()
);

-- PRODUCTS
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,
  description      text,
  price            numeric not null,
  currency         text not null default 'KES',
  category         text,
  brand            text,
  stock            integer not null default 0,
  images           text[],
  is_active        boolean not null default true,
  seo_title        text,
  seo_description  text,
  seo_keywords     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ORDERS
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount     numeric not null,
  currency         text not null default 'KES',
  shipping_address jsonb,
  items            jsonb,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- QUOTES
create table public.quotes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  full_name    text not null,
  email        text not null,
  phone        text,
  company      text,
  message      text,
  items        jsonb,
  status       text not null default 'pending'
                 check (status in ('pending','reviewing','responded','converted','rejected')),
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- BLOG POSTS
create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  content          text,
  excerpt          text,
  cover_image      text,
  author_id        uuid references auth.users(id) on delete set null,
  status           text not null default 'draft'
                     check (status in ('draft','published','scheduled')),
  published_at     timestamptz,
  seo_title        text,
  seo_description  text,
  seo_keywords     text,
  structured_data  jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- SETTINGS
create table public.settings (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      jsonb,
  updated_at timestamptz not null default now()
);

-- =============================================
-- updated_at auto-trigger helper
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_products    before update on public.products    for each row execute function public.set_updated_at();
create trigger set_updated_at_orders      before update on public.orders      for each row execute function public.set_updated_at();
create trigger set_updated_at_quotes      before update on public.quotes      for each row execute function public.set_updated_at();
create trigger set_updated_at_blog_posts  before update on public.blog_posts  for each row execute function public.set_updated_at();
create trigger set_updated_at_settings    before update on public.settings    for each row execute function public.set_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles   enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.quotes     enable row level security;
alter table public.blog_posts enable row level security;
alter table public.settings   enable row level security;

-- Helper: is current user admin or staff?
create or replace function public.is_admin_or_staff()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff')
  );
$$;

-- Helper: is current user admin only?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ---- PROFILES ----
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin_or_staff());

-- ---- PRODUCTS ----
create policy "Anyone can read active products"
  on public.products for select
  using (is_active = true);

create policy "Admin/staff can insert products"
  on public.products for insert
  with check (public.is_admin_or_staff());

create policy "Admin/staff can update products"
  on public.products for update
  using (public.is_admin_or_staff());

create policy "Admin/staff can delete products"
  on public.products for delete
  using (public.is_admin_or_staff());

-- ---- ORDERS ----
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Admin/staff can read all orders"
  on public.orders for select
  using (public.is_admin_or_staff());

create policy "Admin/staff can update orders"
  on public.orders for update
  using (public.is_admin_or_staff());

-- ---- QUOTES ----
create policy "Anyone can insert a quote"
  on public.quotes for insert
  with check (true);

create policy "Users can read own quotes"
  on public.quotes for select
  using (auth.uid() = user_id);

create policy "Admin/staff can read all quotes"
  on public.quotes for select
  using (public.is_admin_or_staff());

create policy "Admin/staff can update quotes"
  on public.quotes for update
  using (public.is_admin_or_staff());

-- ---- BLOG POSTS ----
create policy "Anyone can read published posts"
  on public.blog_posts for select
  using (status = 'published');

create policy "Admin/staff can insert posts"
  on public.blog_posts for insert
  with check (public.is_admin_or_staff());

create policy "Admin/staff can update posts"
  on public.blog_posts for update
  using (public.is_admin_or_staff());

create policy "Admin/staff can delete posts"
  on public.blog_posts for delete
  using (public.is_admin_or_staff());

-- ---- SETTINGS ----
create policy "Admins can read settings"
  on public.settings for select
  using (public.is_admin());

create policy "Admins can insert settings"
  on public.settings for insert
  with check (public.is_admin());

create policy "Admins can update settings"
  on public.settings for update
  using (public.is_admin());

-- =============================================
-- Auto-create profile on signup
-- (backup to the callback route — handles email signups)
-- =============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Replace author_id with a free-text name
ALTER TABLE public.blog_posts
  DROP COLUMN author_id,
  ADD COLUMN author_name text NOT NULL DEFAULT 'Bewama Team',
  ADD COLUMN content_type text NOT NULL DEFAULT 'blog'
    CHECK (content_type IN ('blog', 'resource')),
  ADD COLUMN category text,
  ADD COLUMN pdf_url text,
  ADD COLUMN read_time_minutes integer;

ALTER TABLE public.products 
ADD COLUMN pricing_type text NOT NULL DEFAULT 'fixed'
CHECK (pricing_type IN ('fixed', 'quote'));

CREATE TABLE public.carts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  text,
  items       jsonb NOT NULL DEFAULT '[]'::jsonb,
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'converted', 'abandoned')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_carts_user_id    ON public.carts(user_id)    WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session_id ON public.carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_carts_status     ON public.carts(status);
CREATE INDEX idx_carts_updated_at ON public.carts(updated_at DESC);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_insert" ON public.carts FOR INSERT WITH CHECK (true);
CREATE POLICY "cart_select" ON public.carts FOR SELECT USING (true);
CREATE POLICY "cart_update" ON public.carts FOR UPDATE USING (true);