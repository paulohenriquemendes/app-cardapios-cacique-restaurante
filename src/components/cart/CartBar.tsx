"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cartCount, cartTotal, formatPrice } from "@/lib/format";

/**
 * Botão fixo inferior: 🛒 3 itens — R$ 182,40 [VER PEDIDO]
 * Aparece apenas quando o carrinho tem itens.
 */
export function CartBar({ mesa }: { mesa?: number }) {
  const { cart, hydrated } = useCart();
  const count = cartCount(cart.items);

  if (!hydrated || count === 0) return null;
  const total = cartTotal(cart.items);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <Link
        href={mesa ? `/carrinho?mesa=${mesa}` : "/carrinho"}
        className="mx-auto flex max-w-md items-center justify-between rounded-2xl bg-cacique-brown px-5 py-3.5 text-cream-50 shadow-card-hover transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="relative text-xl" aria-hidden>
            🛒
            <span className="absolute -right-2 -top-1 rounded-full bg-cacique-gold px-1.5 text-[10px] font-bold text-cacique-brown-dark">
              {count}
            </span>
          </span>
          <span className="text-sm font-medium">
            {count} {count === 1 ? "item" : "itens"}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="font-display text-lg font-bold">{formatPrice(total)}</span>
          <span className="rounded-lg bg-cacique-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cacique-brown-dark">
            Ver pedido
          </span>
        </span>
      </Link>
    </div>
  );
}
