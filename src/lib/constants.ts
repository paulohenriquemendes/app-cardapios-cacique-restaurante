export const RESTAURANT_NAME = "Restaurante Cacique";
export const RESTAURANT_TAGLINE = "Cozinha Regional";

export const MENUS = {
  "cafe-da-manha": { label: "Café da Manhã", emoji: "☕" },
  refeicoes: { label: "Refeições", emoji: "🍽️" },
} as const;

export type MenuKey = keyof typeof MENUS;

export const CART_STORAGE_KEY = "cacique-cart-v1";
export const LAST_ORDER_STORAGE_KEY = "cacique-last-order-v1";

export const MAX_QUANTITY_PER_ITEM = 50;
export const MAX_TABLE_NUMBER = 999;
