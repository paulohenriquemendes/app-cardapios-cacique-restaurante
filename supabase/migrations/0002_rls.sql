-- =============================================================
-- Migration 0002: Row Level Security
-- Política de acesso:
--   • Cardápio (menus, categorias, produtos, opções, mesas):
--     leitura pública (anon) — o cliente lê pelo QR Code sem login.
--     Somente o painel administrativo (service role / authenticated)
--     pode gravar.
--   • Pedidos (orders, order_items, order_item_options):
--     NÃO são legíveis pelo anon. A criação de pedidos acontece
--     exclusivamente pela rota de API (server-side, com service
--     role), que recalcula os preços no servidor. O painel
--     administrativo (usuário autenticado) lê e atualiza status.
-- =============================================================

alter table public.restaurants           enable row level security;
alter table public.menus                 enable row level security;
alter table public.categories            enable row level security;
alter table public.products             enable row level security;
alter table public.product_options       enable row level security;
alter table public.product_option_values enable row level security;
alter table public.tables                enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.order_item_options    enable row level security;

-- -------------------------------------------------------------
-- Cardápio: leitura pública de registros ativos
-- -------------------------------------------------------------
create policy "restaurantes públicos (leitura)" on public.restaurants
  for select using (active = true);

create policy "menus públicos (leitura)" on public.menus
  for select using (active = true);

create policy "categorias públicas (leitura)" on public.categories
  for select using (active = true);

create policy "produtos públicos (leitura)" on public.products
  for select using (active = true);

create policy "opções de produtos públicas (leitura)" on public.product_options
  for select using (true);

create policy "valores de opções públicos (leitura)" on public.product_option_values
  for select using (true);

create policy "mesas públicas (leitura)" on public.tables
  for select using (active = true);

-- Escrita no cardápio: apenas administradores autenticados
-- (o service role ignora RLS, usado pela API de pedidos)
create policy "admin cria menus" on public.menus
  for insert to authenticated with check (true);
create policy "admin atualiza menus" on public.menus
  for update to authenticated using (true) with check (true);
create policy "admin cria categorias" on public.categories
  for insert to authenticated with check (true);
create policy "admin atualiza categorias" on public.categories
  for update to authenticated using (true) with check (true);
create policy "admin cria produtos" on public.products
  for insert to authenticated with check (true);
create policy "admin atualiza produtos" on public.products
  for update to authenticated using (true) with check (true);
create policy "admin exclui produtos" on public.products
  for delete to authenticated using (true);

-- -------------------------------------------------------------
-- Pedidos: somente painel administrativo (autenticado)
-- -------------------------------------------------------------
create policy "admin lê pedidos" on public.orders
  for select to authenticated using (true);

create policy "admin atualiza status do pedido" on public.orders
  for update to authenticated using (true) with check (true);

create policy "admin lê itens" on public.order_items
  for select to authenticated using (true);

create policy "admin lê opções dos itens" on public.order_item_options
  for select to authenticated using (true);

-- -------------------------------------------------------------
-- Nota sobre a criação de pedidos:
-- NÃO existe policy de insert para anon em orders/order_items.
-- Pedidos são criados apenas pela rota /api/orders (Next.js),
-- que usa SUPABASE_SERVICE_ROLE_KEY (somente no servidor) e
-- recalcula todos os preços a partir do banco, nunca aceitando
-- o preço enviado pelo navegador.
-- =============================================================
