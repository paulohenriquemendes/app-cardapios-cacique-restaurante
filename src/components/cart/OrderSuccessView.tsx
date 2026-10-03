"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDateTime, formatPrice } from "@/lib/format";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/constants";
import { sendOrderNotification } from "@/services/whatsapp";
import type { Order } from "@/types";

/**
 * Confirmação do pedido: número, mesa, itens, total e botão
 * que abre o WhatsApp com a mensagem do pedido já pronta.
 */
export function OrderSuccessView({ numero }: { numero: number }) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Order;
      if (parsed.number === numero) setOrder(parsed);
    } catch {
      // sem dados: mostra a versão mínima
    }
  }, [numero]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cacique-gold/15 text-3xl" aria-hidden>
          ✓
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-cacique-brown">
          Pedido enviado!
        </h1>
        <p className="mt-1 text-sm text-cacique-brown-soft">
          A cozinha já recebeu seu pedido.
        </p>
        <p className="mt-4 font-display text-4xl font-bold text-cacique-gold">
          #{numero}
        </p>
        {order && (
          <p className="mt-1 text-xs text-cacique-brown-soft">
            Mesa {order.table_number} • {formatDateTime(order.created_at)}
          </p>
        )}
      </div>

      {order ? (
        <section className="mt-8 rounded-xl border border-cream-300 bg-cream-50 p-4 shadow-card">
          <ul className="space-y-3">
            {order.order_items?.map((item) => (
              <li key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cacique-brown">
                      {item.quantity}x {item.product_name}
                    </p>
                    {item.product_size && (
                      <span className="text-[11px] text-cacique-brown-soft/80">
                        {item.product_size}
                      </span>
                    )}
                    {item.order_item_options?.map((o, i) => (
                      <p key={i} className="text-xs text-cacique-brown-soft">
                        {o.option_name}: {o.value_name}
                      </p>
                    ))}
                    {item.notes && (
                      <p className="mt-0.5 text-xs italic text-cacique-brown-soft">
                        “{item.notes}”
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-cacique-brown">
                    {formatPrice(item.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="mt-3 rounded-lg bg-cream-200/60 px-3 py-2 text-xs italic text-cacique-brown-soft">
              Obs. geral: “{order.notes}”
            </p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-cream-300 pt-3">
            <span className="font-display text-lg text-cacique-brown">Total</span>
            <span className="font-display text-xl font-bold text-cacique-brown">
              {formatPrice(order.total)}
            </span>
          </div>
        </section>
      ) : (
        <p className="mt-8 text-center text-sm text-cacique-brown-soft">
          Pedido #{numero} registrado. A cozinha já está cuidando dele.
        </p>
      )}

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={() => order && sendOrderNotification(order)}
          disabled={!order}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          <span aria-hidden>💬</span> Enviar resumo pelo WhatsApp
        </button>
        <Link
          href="/"
          className="block rounded-xl border border-cacique-gold/40 bg-cream-50 py-3 text-center text-sm font-semibold text-cacique-brown"
        >
          Voltar ao início
        </Link>
      </div>

      <p className="mt-auto pt-8 text-center text-[11px] text-cacique-brown-soft/70">
        Obrigado pela preferência — Restaurante Cacique / Cozinha Regional
      </p>
    </main>
  );
}
