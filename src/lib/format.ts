import type { CartItem } from "@/types";

/** Formata número como moeda brasileira: R$ 130,90 */
export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Preço unitário do item do carrinho (base + adicionais) */
export function cartItemUnitPrice(item: CartItem): number {
  return (
    item.basePrice +
    item.options.reduce((sum, opt) => sum + opt.priceModifier, 0)
  );
}

/** Preço total do item (unitário × quantidade) */
export function cartItemTotal(item: CartItem): number {
  return cartItemUnitPrice(item) * item.quantity;
}

/** Total do carrinho */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + cartItemTotal(item), 0);
}

/** Quantidade total de itens do carrinho */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Data/hora no padrão brasileiro */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
