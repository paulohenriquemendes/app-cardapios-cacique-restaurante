"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import {
  cartItemTotal,
  cartItemUnitPrice,
  cartTotal,
  formatPrice,
} from "@/lib/format";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/constants";
import { placeOrder } from "@/services/orders";
import type { Order } from "@/types";

/**
 * Carrinho: editar quantidades, observações, ver subtotal/total,
 * definir mesa (modo demonstração quando não veio do QR Code)
 * e confirmar o pedido (recalculado no servidor).
 */
export function CartView() {
  const { cart, hydrated, setQuantity, setNotes, removeItem, clearCart, setTableNumber } =
    useCart();
  const router = useRouter();

  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cartTotal(cart.items);

  async function handleConfirm() {
    setError(null);
    if (cart.items.length === 0) return;
    if (!cart.tableNumber || cart.tableNumber < 1) {
      setError("Selecione o número da sua mesa para enviar o pedido.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await placeOrder({
        tableNumber: cart.tableNumber,
        notes: orderNotes.trim() || null,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
          options: item.options.reduce<Record<string, string[]>>(
            (acc, opt) => {
              acc[opt.optionId] = [...(acc[opt.optionId] ?? []), opt.valueId];
              return acc;
            },
            {}
          ),
        })),
      });

      // guarda o pedido para a tela de confirmação / WhatsApp
      try {
        sessionStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify(response.order)
        );
      } catch {
        // sem storage: a tela de confirmação mostra o essencial
      }
      clearCart();
      router.push(`/pedido/${response.order.number}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar o pedido.");
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="animate-pulse text-sm text-cacique-brown-soft">Carregando…</p>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="text-5xl" aria-hidden>🛒</span>
        <h1 className="mt-4 font-display text-2xl text-cacique-brown">
          Seu pedido está vazio
        </h1>
        <p className="mt-2 text-sm text-cacique-brown-soft">
          Escolha um cardápio e adicione itens.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/cafe-da-manha"
            className="rounded-xl border border-cacique-gold/40 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-cacique-brown"
          >
            ☕ Café da Manhã
          </Link>
          <Link
            href="/refeicoes"
            className="rounded-xl bg-cacique-brown px-4 py-2.5 text-sm font-semibold text-cream-50"
          >
            🍽️ Refeições
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pb-6 pt-4">
      <header className="flex items-center justify-between">
        <Link href={cart.menuSlug === "cafe-da-manha" ? "/cafe-da-manha" : "/refeicoes"} className="flex items-center gap-2 text-sm text-cacique-brown-soft">
          <span aria-hidden>←</span> Continuar comprando
        </Link>
        <h1 className="font-display text-xl font-bold text-cacique-brown">Seu Pedido</h1>
        <button
          type="button"
          onClick={() => {
            if (confirm("Remover todos os itens do pedido?")) clearCart();
          }}
          className="text-xs text-cacique-brown-soft/70 underline-offset-2 hover:underline"
        >
          limpar
        </button>
      </header>

      {/* mesa */}
      <section className="mt-4 rounded-xl border border-cream-300 bg-cream-50 p-4 shadow-card">
        {cart.tableNumber > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-cacique-brown-soft">Mesa</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-cacique-brown">
                {cart.tableNumber}
              </span>
              <button
                type="button"
                onClick={() => setTableNumber(0)}
                className="text-[11px] text-cacique-gold underline-offset-2 hover:underline"
              >
                alterar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="mesa-select" className="text-sm font-medium text-cacique-brown">
              Número da mesa{" "}
              <span className="text-[11px] font-normal text-cacique-brown-soft/70">
                (modo demonstração — pelo QR Code a mesa é identificada automaticamente)
              </span>
            </label>
            <select
              id="mesa-select"
              value=""
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm text-cacique-brown focus:border-cacique-gold focus:outline-none"
            >
              <option value="">Selecione a mesa…</option>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Mesa {String(n).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* itens */}
      <ul className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <li key={item.key} className="rounded-xl border border-cream-300 bg-cream-50 p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-[15px] font-semibold text-cacique-brown">
                  {item.name}
                </h2>
                {item.sizeLabel && (
                  <span className="text-[11px] text-cacique-brown-soft/80">{item.sizeLabel}</span>
                )}
                {item.options.map((opt) => (
                  <p key={opt.valueId} className="mt-0.5 text-xs text-cacique-brown-soft">
                    {opt.optionName}: <span className="text-cacique-brown">{opt.valueName}</span>
                    {opt.priceModifier > 0 && (
                      <span className="text-cacique-gold"> +{formatPrice(opt.priceModifier)}</span>
                    )}
                  </p>
                ))}
                <p className="mt-1 text-xs font-semibold text-cacique-brown-soft">
                  {formatPrice(cartItemUnitPrice(item))} / un.
                </p>
              </div>
              <span className="shrink-0 font-display text-base font-bold text-cacique-brown">
                {formatPrice(cartItemTotal(item))}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-cream-300 bg-cream-100 px-1.5 py-1">
                <button
                  type="button"
                  aria-label="Diminuir"
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded text-lg font-bold text-cacique-brown-soft active:bg-cream-200"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold text-cacique-brown">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar"
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded text-lg font-bold text-cacique-brown-soft active:bg-cream-200"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const nova = prompt("Observação do item:", item.notes ?? "");
                    if (nova !== null) setNotes(item.key, nova);
                  }}
                  className="text-cacique-brown-soft underline-offset-2 hover:underline"
                >
                  {item.notes ? "Editar obs." : "Observação"}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-red-600 underline-offset-2 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>

            {item.notes && (
              <p className="mt-2 rounded-lg bg-cream-200/60 px-3 py-1.5 text-xs italic text-cacique-brown-soft">
                “{item.notes}”
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* observação geral */}
      <section className="mt-4">
        <label htmlFor="order-notes" className="text-sm font-medium text-cacique-brown">
          Observação geral do pedido
        </label>
        <textarea
          id="order-notes"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Ex.: entregar tudo junto…"
          className="mt-2 w-full resize-none rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm text-cacique-brown placeholder:text-cacique-brown-soft/50 focus:border-cacique-gold focus:outline-none"
        />
      </section>

      {/* total + confirmar */}
      <section className="mt-5 rounded-xl border border-cacique-gold/30 bg-cream-50 p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-cacique-brown">Total</span>
          <span className="font-display text-2xl font-bold text-cacique-brown">
            {formatPrice(total)}
          </span>
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="mt-3 w-full rounded-xl bg-cacique-brown py-3.5 font-semibold text-cream-50 transition active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Confirmar pedido"}
        </button>
        <p className="mt-2 text-center text-[11px] text-cacique-brown-soft/70">
          Os valores são recalculados pelo servidor ao confirmar.
        </p>
      </section>
    </main>
  );
}
