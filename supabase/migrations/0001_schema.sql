-- =============================================================
-- APP CARDAPIOS CACIQUE RESTAURANTE
-- Migration 0001: schema completo
-- Banco: Supabase (PostgreSQL)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Tipos
-- -------------------------------------------------------------
create type public.order_status as enum (
  'NOVO',
  'CONFIRMADO',
  'EM_PREPARO',
  'PRONTO',
  'FINALIZADO',
  'CANCELADO'
);

create type public.option_selection_type as enum ('single', 'multiple');

-- -------------------------------------------------------------
-- restaurants
-- -------------------------------------------------------------
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  address text,
  whatsapp text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- menus (CAFÉ DA MANHÃ / REFEIÇÕES)
-- -------------------------------------------------------------
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  slug text not null unique,             -- 'cafe-da-manha' | 'refeicoes'
  name text not null,
  description text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- categories
-- -------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,                      -- observações/rodapé do cardápio físico
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (menu_id, slug)
);

-- -------------------------------------------------------------
-- products
-- Obs.: o código vem do cardápio físico; o cardápio impresso
-- possui códigos duplicados (ex.: 1089), portanto NÃO há
-- constraint de unicidade em (menu_id, code).
-- image_is_temporary marca imagens de demonstração que devem
-- ser substituídas pela fotografia real do restaurante.
-- -------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  code text,
  name text not null,
  description text,
  size_label text,                       -- peso/volume (ex.: '400g', '300ml')
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  image_is_temporary boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_menu_idx on public.products(menu_id);
create index products_category_idx on public.products(category_id);
create index products_code_idx on public.products(code);

-- -------------------------------------------------------------
-- product_options (grupos de opções: seleção única ou múltipla)
-- -------------------------------------------------------------
create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,                    -- ex.: 'Guarnições', 'Pão', 'Fruta'
  selection_type public.option_selection_type not null default 'single',
  required boolean not null default false,
  min_select int not null default 0,
  max_select int not null default 1,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_options_product_idx on public.product_options(product_id);

-- -------------------------------------------------------------
-- product_option_values (valores de cada opção e seu acréscimo)
-- -------------------------------------------------------------
create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  name text not null,
  price_modifier numeric(10,2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index product_option_values_option_idx on public.product_option_values(option_id);

-- -------------------------------------------------------------
-- tables (mesas para os QR Codes)
-- -------------------------------------------------------------
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  label text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- orders
-- Sequência dedicada para número de pedido legível.
-- -------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number int not null unique default nextval('public.order_number_seq'),
  table_number int not null check (table_number > 0 and table_number <= 999),
  status public.order_status not null default 'NOVO',
  notes text,
  total numeric(10,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

-- -------------------------------------------------------------
-- order_items (snapshot do produto no momento do pedido)
-- -------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_code text,
  product_name text not null,
  product_size text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0 and quantity <= 50),
  notes text,
  total numeric(10,2) not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);

-- -------------------------------------------------------------
-- order_item_options (opções escolhidas por item)
-- -------------------------------------------------------------
create table public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  option_name text not null,
  value_name text not null,
  price_modifier numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index order_item_options_item_idx on public.order_item_options(order_item_id);

-- -------------------------------------------------------------
-- updated_at automático
-- -------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_restaurants_updated before update on public.restaurants
  for each row execute function public.handle_updated_at();
create trigger trg_menus_updated before update on public.menus
  for each row execute function public.handle_updated_at();
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.handle_updated_at();
create trigger trg_products_updated before update on public.products
  for each row execute function public.handle_updated_at();
create trigger trg_product_options_updated before update on public.product_options
  for each row execute function public.handle_updated_at();
create trigger trg_tables_updated before update on public.tables
  for each row execute function public.handle_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.handle_updated_at();

-- -------------------------------------------------------------
-- RPC: próximo número de pedido (chamada com service role)
-- -------------------------------------------------------------
create or replace function public.next_order_number()
returns int
language sql
security definer
set search_path = public
as $$
  select nextval('public.order_number_seq');
$$;

-- Realtime habilitado para a tabela de pedidos
alter publication supabase_realtime add table public.orders;
