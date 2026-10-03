# 🍽️ APP CARDAPIOS CACIQUE RESTAURANTE

Cardápio digital e sistema de pedidos por **QR Code** para o **Restaurante Cacique / Cozinha Regional**.

O cliente escaneia o QR Code da mesa, navega pelo cardápio no celular, personaliza o pedido, confirma — e o pedido aparece **automaticamente** no painel da cozinha, em tempo real.

**Dois cardápios, um só sistema** (exatamente como nos cardápios físicos):

- ☕ **CAFÉ DA MANHÃ** → `/cafe-da-manha`
- 🍽️ **REFEIÇÕES** → `/refeicoes`

---

## 📋 Sumário

1. [Fluxo do cliente](#-fluxo-do-cliente)
2. [Arquitetura](#-arquitetura)
3. [Stack](#-stack)
4. [Estrutura de pastas](#-estrutura-de-pastas)
5. [Como executar localmente](#-como-executar-localmente)
6. [Configurar o Supabase](#-configurar-o-supabase)
7. [Deploy na Vercel](#-deploy-na-vercel)
8. [QR Codes por mesa](#-qr-codes-por-mesa)
9. [Cadastrar imagens dos produtos](#-cadastrar-imagens-dos-produtos)
10. [Cadastrar novas mesas](#-cadastrar-novas-mesas)
11. [Alterar produtos e preços](#-alterar-produtos-e-preços)
12. [Painel administrativo](#-painel-administrativo)
13. [WhatsApp](#-whatsapp)
14. [Segurança](#-segurança)
15. [Sobre os dados (fidelidade ao cardápio físico)](#-sobre-os-dados-fidelidade-ao-cardápio-físico)

---

## 🔗 Fluxo do cliente

```
QR Code da mesa (/mesa/12)
   ↓
Escolha do cardápio (Café da Manhã | Refeições)
   ↓
Navegação por categorias + busca por nome/código/categoria
   ↓
Detalhes do produto (foto, descrição, peso/volume, opções, adicionais, observação)
   ↓
Carrinho (editar quantidades, observações, subtotal e total)
   ↓
Confirmar pedido
   ↓
Número único do pedido (#1042) + resumo pelo WhatsApp
   ↓
Pedido aparece em TEMPO REAL no painel /admin
```

Não exige cadastro, login, senha, download ou instalação. Prioridade total para smartphone.

---

## 🏗 Arquitetura

```
GitHub (código-fonte)
   ↓  (push)
Vercel (hospedagem + HTTPS)
   ↓
Next.js 14 (App Router, React, TypeScript, Tailwind)
   ↓
Supabase (PostgreSQL + Realtime + Storage + Auth)
```

- **Páginas do cardápio**: leitura pública (anon key, protegida por RLS).
- **Criação de pedidos**: rota de API `/api/orders` (somente servidor) valida tudo e **recalcula os preços no banco** — o navegador nunca define preços.
- **Painel `/admin`**: autenticação Supabase Auth, protegido por middleware; pedidos chegam via **Supabase Realtime** (sem atualizar a página).
- **WhatsApp**: camada desacoplada (`sendOrderNotification`), pronta para evoluir para a API Business sem mexer nas telas.

---

## 🧰 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Estilo | Tailwind CSS (identidade visual do cardápio físico: creme, marrom escuro, dourado) |
| Banco | Supabase (PostgreSQL) |
| Tempo real | Supabase Realtime |
| Arquivos (fotos) | Supabase Storage |
| Autenticação admin | Supabase Auth |
| Hospedagem | Vercel |
| Versionamento | GitHub |

---

## 📁 Estrutura de pastas

```
├── middleware.ts                # proteção das rotas /admin
├── supabase/
│   ├── migrations/0001_schema.sql   # tabelas, tipos, triggers, sequência de pedidos
│   ├── migrations/0002_rls.sql      # Row Level Security
│   └── seed.sql                     # TODOS os produtos reais dos 2 cardápios
├── scripts/generate_seed.py     # gerador do seed (fonte dos dados dos PDFs)
├── public/
│   ├── manifest.json            # PWA (instalável no celular, se quiser)
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx             # tela inicial: escolha do cardápio
│   │   ├── cafe-da-manha/       # cardápio Café da Manhã
│   │   ├── refeicoes/           # cardápio Refeições
│   │   ├── mesa/[mesa]/         # QR Code: /mesa/01, /mesa/02, …
│   │   ├── carrinho/            # carrinho + confirmação
│   │   ├── pedido/[numero]/     # confirmação do pedido + WhatsApp
│   │   ├── admin/               # painel de pedidos (protegido)
│   │   │   └── login/
│   │   └── api/orders/          # criação de pedidos (server-side)
│   ├── components/              # componentes reutilizáveis
│   │   ├── menu/                # cards, modal de produto, busca
│   │   ├── cart/                # carrinho, barra fixa, confirmação
│   │   ├── admin/               # painel, cards de pedido, status
│   │   └── ui/                  # atomos visuais
│   ├── hooks/                   # useCart, useRealtimeOrders
│   ├── lib/                     # clientes Supabase, formato, menu
│   ├── services/                # orders, whatsapp (camadas isoladas)
│   └── types/                   # tipos TypeScript
├── .env.example                 # modelo de variáveis de ambiente
└── README.md
```

---

## ▶️ Como executar localmente

Pré-requisitos: **Node.js 20+** e um projeto Supabase (criado no passo seguinte).

```bash
# 1. instalar dependências
npm install

# 2. configurar ambiente
cp .env.example .env.local
#    preencha os valores do seu projeto Supabase (ver .env.example)

# 3. rodar em desenvolvimento
npm run dev
# abre http://localhost:3000
```

Build de produção:

```bash
npm run build && npm start
```

---

## 🗄 Configurar o Supabase

### 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → **New project**.
2. Guarde a **senha do banco** e a região mais próxima (ex.: South America).

### 2. Criar as tabelas (migrations)

No **SQL Editor** do Supabase, execute em ordem:

1. O conteúdo de `supabase/migrations/0001_schema.sql`
2. O conteúdo de `supabase/migrations/0002_rls.sql`

Cria as tabelas `restaurants, menus, categories, products, product_options, product_option_values, orders, order_items, order_item_options, tables`, com UUID, `created_at/updated_at/active/sort_order`, Row Level Security e a sequência de números de pedido.

> 💡 Alternativa: com a CLI `supabase` instalada, use `supabase db push` a partir da pasta `supabase/`.

### 3. Carregar o cardápio (seed)

Ainda no **SQL Editor**, execute o conteúdo de `supabase/seed.sql`.

Isso insere **todos os produtos reais dos dois cardápios físicos** (419 produtos, com código, nome, descrição, peso/volume, preço, categoria e opções), o restaurante, os 2 menus e as mesas 01–20.

### 4. Criar o usuário administrador

1. Supabase → **Authentication** → **Users** → **Add user**.
2. Crie com e-mail/senha (ex.: `cozinha@cacique.com`).
3. Use essas credenciais em `/admin/login`.

### 5. Criar o bucket de imagens

1. Supabase → **Storage** → **New bucket** → nome `products`.
2. Marque **Public bucket** (as fotos do cardápio são públicas).
3. Nas políticas do bucket, permita leitura pública (`SELECT` para `anon`).
   O upload é feito por você, pelo painel do Supabase — não pelo cliente.

### 6. Copiar as chaves para o `.env.local`

Supabase → **Settings → API**:

| Variável | De onde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (⚠️ segredo, só no servidor) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | número do restaurante (só dígitos, com DDI: `5585…`) |
| `NEXT_PUBLIC_APP_URL` | URL pública (local: `http://localhost:3000`) |

---

## 🚀 Deploy na Vercel

1. Suba este projeto para o GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório.
3. Em **Environment Variables**, adicione as variáveis do `.env.example` (as mesmas do `.env.local`).
4. Clique em **Deploy**. A Vercel detecta o Next.js automaticamente.
5. A cada `git push` na branch principal, o site é atualizado sozinho.

> ⚠️ **Nunca** coloque a `service_role key` com o prefixo `NEXT_PUBLIC_` — tudo com esse prefixo fica visível no navegador.

---

## 📱 QR Codes por mesa

Cada mesa tem um QR Code que abre a URL da mesa. O número da mesa vem pela URL — o cliente nunca digita nada.

```
https://SEU-DOMINIO/mesa/01     → Mesa 01 (escolha do cardápio)
https://SEU-DOMINIO/mesa/01/cafe-da-manha
https://SEU-DOMINIO/mesa/01/refeicoes
```

Para **gerar os QR Codes** de uma vez, use qualquer gerador de QR Code em lote (ex.: `qrcode` no terminal):

```bash
npx qrcode "https://SEU-DOMINIO/mesa/01" -o mesa-01.png
```

O seed já cria as mesas 01 a 20 no banco. Imprima e cole na mesa — pronto.

---

## 🖼 Cadastrar imagens dos produtos

As **fotos reais ainda não foram enviadas pelo restaurante**. Enquanto não há foto, o app mostra um marcador elegante (nunca uma foto genérica se passando pelo prato real).

Para cadastrar as fotos reais, **sem alterar nenhum código e sem mexer no cadastro do produto**:

1. Supabase → **Storage** → bucket `products` → **Upload**.
2. Copie a **Public URL** do arquivo (ex.: `https://xxx.supabase.co/storage/v1/object/public/products/carne-de-sol.jpg`).
3. Supabase → **Table Editor** → `products` → no produto desejado, cole a URL no campo `image_url` (e deixe `image_is_temporary = false`).
4. A foto aparece automaticamente no cardápio (a página se atualiza em até 1 minuto).

**Boas práticas**: JPG, ~800×600px, até ~200 KB por foto (carregamento rápido no celular).

---

## 🪑 Cadastrar novas mesas

```sql
insert into public.tables (number, label, active)
values (21, 'Mesa 21', true)
on conflict (number) do nothing;
```

Depois gere o QR Code da nova mesa: `https://SEU-DOMINIO/mesa/21`.

---

## ✏️ Alterar produtos e preços

### Pelo painel do Supabase (mais fácil)

**Table Editor** → tabela `products` → edite `price`, `name`, `description`, `active` (desativar esconde o item do cardápio) ou `sort_order` (ordem de exibição). As páginas levam até 1 minuto para refletir (cache de 60s).

### Por SQL

```sql
-- trocar o preço de um produto pelo código (ex.: 055)
update public.products
set price = 135.90
where code = '055' and menu_id = (
  select id from public.menus where slug = 'refeicoes'
);

-- ocultar um produto do cardápio
update public.products set active = false where code = '769';

-- criar um produto novo
insert into public.products (menu_id, category_id, code, name, description, size_label, price, sort_order)
select m.id, c.id, '999', 'Nome do produto', 'Descrição', '300g', 25.90, 99
from public.menus m
join public.categories c on c.menu_id = m.id and c.slug = 'sobremesas-da-casa'
where m.slug = 'cafe-da-manha';
```

> O preço cobrado no pedido é sempre o que está no banco no momento da confirmação — se o preço mudar, pedidos novos já usam o valor novo.

---

## 🛡 Painel administrativo

- URL: **`/admin`** — exige login (Supabase Auth).
- Pedidos novos aparecem **sozinhos** (Supabase Realtime) e ficam destacados em dourado.
- Filtros por status: `NOVO → CONFIRMADO → EM PREPARO → PRONTO → FINALIZADO` (+ `CANCELADO`).
- Cada card mostra número, mesa, itens, quantidades, opções, observações e total.
- Botões de avanço de status e cancelamento em cada pedido.

---

## 💬 WhatsApp

A primeira versão gera a mensagem do pedido e **abre o WhatsApp com o texto pré-preenchido** (botão na confirmação do pedido):

```
NOVO PEDIDO — RESTAURANTE CACIQUE

Pedido: #1042
Mesa: 12

2x Carne de sol na manteiga da terra
    • Guarnições: Arroz
    • Guarnições: Baião
    • Guarnições: Feijão
1x Coca-Cola 350ml

Total: R$ 270,30
```

- O número do WhatsApp vem de `NEXT_PUBLIC_WHATSAPP_NUMBER` (nunca do código).
- A integração vive isolada em `src/services/whatsapp.ts` (interface `OrderNotificationChannel`). Para a **futura API WhatsApp Business/Cloud**, basta implementar `CloudApiChannel` e trocar uma linha — nenhuma tela muda.

---

## 🔒 Segurança

- **RLS ativado em todas as tabelas**: anônimo só lê o cardápio; pedidos só são visíveis para usuários autenticados.
- **Criação de pedidos somente via `/api/orders`** (server-side, service role): valida produtos ativos, opções obrigatórias, mínimos/máximos, quantidade (1–50) e mesa (1–999), e **recalcula o total no servidor**. O preço do navegador é ignorado.
- **Números de pedido** gerados por sequência do banco (sem duplicidade).
- `/admin` protegido por middleware + sessão Supabase Auth.
- Segredos só em variáveis de ambiente; service role key nunca vai ao navegador.
- Snapshots: itens e opções são gravados como estavam no momento do pedido.

---

## 📖 Sobre os dados (fidelidade ao cardápio físico)

- **Fonte única de verdade**: os dois cardápios impressos fornecidos em PDF (Refeições e Café da Manhã). Nenhum produto, preço, descrição ou peso foi inventado.
- 419 produtos transcritos: 232 do Café da Manhã e 187 de Refeições, em suas categorias originais.
- Opções reais modeladas: pães dos sanduíches, guarnições das carnes na brasa (escolha 3), acompanhamentos do café regional e dos pratos executivos, frutas dos sucos/vitaminas, tamanhos de saladas, sabores de refrigerante, quantidades de frutas (1 ou 2).
- O cardápio impresso repete alguns códigos (ex.: `1089` para mini pastel de carne e misto; `917` no café). Mantidos como no original — o sistema identifica o produto pelo ID interno, não pelo código.
- Pequenos erros de digitação do material impresso foram normalizados (ex.: “água de 1,5ml” → 1,5L). Descrições e textos do restaurante foram preservados.
- **Imagens**: temporárias/ausentes até o restaurante enviar as fotografias reais; o cadastro do produto não muda quando a foto real chega.

---

**Restaurante Cacique / Cozinha Regional** — empresa familiar que carrega a autenticidade da culinária regional, parada obrigatória entre a Capital e o interior do Ceará.
