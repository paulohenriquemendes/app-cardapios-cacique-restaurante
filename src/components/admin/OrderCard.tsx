"use client";

import { useState } from "react";
import { formatDateTime, formatPrice } from "@/lib/format";
import { NEXT_STATUS, type Order, type OrderStatus } from "@/types";
import { ACTION_LABEL, StatusBadge } from "./StatusBadge";

/**
 * Card de pedido do painel: número, mesa, itens, observações,
 * total, próximo status e cancelamento.
 */
export function OrderCard({
  order,
  onNext,
  onCancel,
}: {
  order: Order;
  onNext: (order: Order, status: OrderStatus) => void;
  onCancel: (order: Order) => void;
}) {
  const [open, setOpen] = useState(order.status === "NOVO");
  const next = NEXT_STATUS[order.status];
  const items = order.order_items ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <li
      className={`overflow-hidden rounded-xl border bg-cream-50 shadow-card transition ${
        order.status === "NOVO"
          ? "border-cacique-gold ring-2 ring-cacique-gold/30"
          : "border-cream-300"
      }`}
    >
      {/* resumo */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div>
          <p className="font-display text-lg font-bold text-cacique-brown">
            #{order.number}
          </p>
          <p className="text-xs text-cacique-brown-soft">
            Mesa {String(order.table_number).padStart(2, "0")} • {itemCount}{" "}
            {itemCount === 1 ? "item" : "itens"} • {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-cacique-brown">
            {formatPrice(order.total)}
          </span>
          <StatusBadge status={order.status} />
        </div>
      </button>

      {/* detalhes */}
      {open && (
        <div className="border-t border-cream-300 px-4 py-3">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-cacique-brown">
                    <span className="font-bold">{item.quantity}x</span> {item.product_name}
                    {item.product_size && (
                      <span className="text-[11px] text-cacique-brown-soft/80">
                        {" "}({item.product_size})
                      </span>
                    )}
                  </p>
                  <span className="shrink-0 text-sm font-semibold text-cacique-brown-soft">
                    {formatPrice(item.total)}
                  </span>
                </div>
                {item.order_item_options?.map((o, i) => (
                  <p key={i} className="pl-5 text-xs text-cacique-brown-soft">
                    • {o.option_name}: {o.value_name}
                  </p>
                ))}
                {item.notes && (
                  <p className="pl-5 text-xs italic text-amber-700">“{item.notes}”</p>
                )}
              </li>
            ))}
          </ul>
          {order.notes && (
            <p className="mt-2 rounded-lg bg-cream-200/60 px-3 py-2 text-xs italic text-cacique-brown-soft">
              Obs. geral: “{order.notes}”
            </p>
          )}

          {/* ações */}
          <div className="mt-3 flex gap-2">
            {next && (
              <button
                type="button"
                onClick={() => onNext(order, next)}
                className="flex-1 rounded-lg bg-cacique-brown py-2.5 text-sm font-semibold text-cream-50 transition active:scale-[0.99]"
              >
                {ACTION_LABEL[order.status] ?? next}
              </button>
            )}
            {order.status !== "FINALIZADO" && order.status !== "CANCELADO" && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
