"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY, MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import type { Cart, CartItem } from "@/types";

interface CartContextValue {
  cart: Cart;
  hydrated: boolean;
  /** adiciona item; se já existir item idêntico, soma a quantidade */
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  setNotes: (key: string, notes: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setTableNumber: (table: number) => void;
  setMenuSlug: (slug: Cart["menuSlug"]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: Cart = { menuSlug: null, tableNumber: 0, items: [] };

/** chave única do item = produto + opções escolhidas (ordenação estável) */
export function itemKey(productId: string, options: { valueId: string }[]): string {
  const optionKeys = options
    .map((o) => o.valueId)
    .sort()
    .join(",");
  return `${productId}::${optionKeys}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);

  // carrega do localStorage (carrinho persistente na sessão do dispositivo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Cart;
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        }
      }
    } catch {
      // carrinho corrompido: recomeça vazio
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage indisponível (modo privado): carrinho vive só em memória
    }
  }, [cart, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "key" | "quantity">, quantity: number) => {
      const key = itemKey(item.productId, item.options);
      setCart((prev) => {
        const existing = prev.items.find((i) => i.key === key);
        let items: CartItem[];
        if (existing) {
          items = prev.items.map((i) =>
            i.key === key
              ? {
                  ...i,
                  quantity: Math.min(
                    i.quantity + quantity,
                    MAX_QUANTITY_PER_ITEM
                  ),
                  notes: item.notes || i.notes,
                }
              : i
          );
        } else {
          items = [...prev.items, { ...item, key, quantity }];
        }
        return prev;
      });
    },
    []
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items
        .map((i) =>
          i.key === key
            ? { ...i, quantity: Math.max(0, Math.min(quantity, MAX_QUANTITY_PER_ITEM)) }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  }, []);

  const setNotes = useCallback((key: string, notes: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.key === key ? { ...i, notes: notes || null } : i
      ),
    }));
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.key !== key),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart((prev) => ({ ...prev, items: [] }));
  }, []);

  const setTableNumber = useCallback((table: number) => {
    setCart((prev) => ({ ...prev, tableNumber: table }));
  }, []);

  const setMenuSlug = useCallback((slug: Cart["menuSlug"]) => {
    setCart((prev) => ({ ...prev, menuSlug: slug }));
  }, []);

  const value = useMemo(
    () => ({
      cart,
      hydrated,
      addItem,
      setQuantity,
      setNotes,
      removeItem,
      clearCart,
      setTableNumber,
      setMenuSlug,
    }),
    [cart, hydrated, addItem, setQuantity, setNotes, removeItem, clearCart, setTableNumber, setMenuSlug]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
