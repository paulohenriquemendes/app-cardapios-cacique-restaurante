"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseBrowserClient } from "@/lib/supabase/client";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { formatDateTime, formatPrice } from "@/lib/format";
import { updateOrderStatus } from "@/services/orders";
import {
  NEXT_STATUS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
} from "@/types";
import { OrderCard } from "./OrderCard";

/**
 * Painel de pedidos: lista em tempo real (Supabase Realtime),
 * filtros por status, detalhes dos itens e alteração de status.
 * Pedidos NOVOS são destacados.
 */
export function AdminOrdersBoard() {
  const [supabase, setSupabase] = useState<SupabaseBrowserClient | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "TODOS">("TODOS");

  const fetchOrders = useCallback(async () => {
    const client = supabase ?? createClient();
    setSupabase(client);
    const { data } = await client
      .from("orders")
      .select("*, order_items(*, order_item_options(*))")
      .order("created_at", { ascending: false })
      .limit(80);
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const { connected } = useRealtimeOrders(supabase, fetchOrders);

  async function handleUpdateStatus(order: Order, status: OrderStatus) {
    // otimista: atualiza na hora, realtime confirma
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
    await updateOrderStatus(supabase ?? createClient(), order.id, status);
  }

  const filtered = useMemo(
    () =>
      filter === "TODOS"
        ? orders
        : orders.filter((o) => o.status === filter),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1);
    return map;
  }, [orders]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      {/* filtros */}
      <nav className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["TODOS", ...ORDER_STATUSES] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === status
                ? "border-cacique-brown bg-cacique-brown text-cream-50"
                : "border-cream-300 bg-cream-50 text-cacique-brown-soft hover:border-cacique-gold/50"
            }`}
          >
            {status === "TODOS"
              ? `Todos (${orders.length})`
              : `${status} (${counts.get(status) ?? 0})`}
          </button>
        ))}
      </nav>

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-cacique-brown-soft/70">
        <span
          className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-cream-300"}`}
          aria-hidden
        />
        {connected ? "Tempo real ativo — pedidos novos aparecem automaticamente" : "Conectando ao tempo real…"}
      </p>

      {/* lista */}
      {loading ? (
        <p className="mt-8 animate-pulse text-center text-sm text-cacique-brown-soft">
          Carregando pedidos…
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-cacique-brown-soft">
          Nenhum pedido {filter !== "TODOS" ? `com status ${filter}` : "ainda"}.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onNext={handleUpdateStatus}
              onCancel={(o) => handleUpdateStatus(o, "CANCELADO")}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
