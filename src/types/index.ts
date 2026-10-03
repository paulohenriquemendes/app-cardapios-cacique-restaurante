// =============================================================
// Tipos do APP CARDAPIOS CACIQUE RESTAURANTE
// =============================================================

export type MenuSlug = "cafe-da-manha" | "refeicoes";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  whatsapp: string | null;
}

export interface Menu {
  id: string;
  slug: MenuSlug;
  name: string;
  description: string | null;
}

export interface Category {
  id: string;
  menu_id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export type OptionSelectionType = "single" | "multiple";

export interface ProductOptionValue {
  id: string;
  option_id: string;
  name: string;
  price_modifier: number;
  sort_order: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  selection_type: OptionSelectionType;
  required: boolean;
  min_select: number;
  max_select: number;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface Product {
  id: string;
  menu_id: string;
  category_id: string;
  code: string | null;
  name: string;
  description: string | null;
  size_label: string | null;
  price: number;
  image_url: string | null;
  image_is_temporary: boolean;
  active: boolean;
  sort_order: number;
  options?: ProductOption[];
}

/** Categoria com seus produtos (usado pela tela de cardápio) */
export interface CategoryWithProducts extends Category {
  products: Product[];
}

// -------------------------------------------------------------
// Carrinho (cliente)
// -------------------------------------------------------------
export interface CartItemOption {
  optionId: string;
  optionName: string;
  valueId: string;
  valueName: string;
  priceModifier: number;
}

export interface CartItem {
  /** chave única: produto + opções escolhidas */
  key: string;
  productId: string;
  productCode: string | null;
  name: string;
  sizeLabel: string | null;
  basePrice: number;
  quantity: number;
  notes: string | null;
  options: CartItemOption[];
}

export interface Cart {
  menuSlug: MenuSlug | null;
  tableNumber: number;
  items: CartItem[];
}

// -------------------------------------------------------------
// Pedidos
// -------------------------------------------------------------
export type OrderStatus =
  | "NOVO"
  | "CONFIRMADO"
  | "EM_PREPARO"
  | "PRONTO"
  | "FINALIZADO"
  | "CANCELADO";

export const ORDER_STATUSES: OrderStatus[] = [
  "NOVO",
  "CONFIRMADO",
  "EM_PREPARO",
  "PRONTO",
  "FINALIZADO",
  "CANCELADO",
];

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  NOVO: "CONFIRMADO",
  CONFIRMADO: "EM_PREPARO",
  EM_PREPARO: "PRONTO",
  PRONTO: "FINALIZADO",
  FINALIZADO: null,
  CANCELADO: null,
};

export interface OrderItemOptionSnapshot {
  option_name: string;
  value_name: string;
  price_modifier: number;
}

export interface OrderItemSnapshot {
  id: string;
  product_code: string | null;
  product_name: string;
  product_size: string | null;
  unit_price: number;
  quantity: number;
  notes: string | null;
  total: number;
  order_item_options: OrderItemOptionSnapshot[];
}

export interface Order {
  id: string;
  number: number;
  table_number: number;
  status: OrderStatus;
  notes: string | null;
  total: number;
  created_at: string;
  order_items?: OrderItemSnapshot[];
}

// -------------------------------------------------------------
// Payload de criação de pedido (navegador → API)
// O preço NÃO é enviado: o servidor recalcula tudo.
// -------------------------------------------------------------
export interface OrderPayloadItem {
  productId: string;
  quantity: number;
  notes?: string | null;
  /** escolhas: optionId → lista de valueIds */
  options: Record<string, string[]>;
}

export interface OrderPayload {
  tableNumber: number;
  notes?: string | null;
  items: OrderPayloadItem[];
}

export interface OrderCreatedResponse {
  ok: true;
  order: Order;
}

export interface OrderErrorResponse {
  ok: false;
  error: string;
}
