"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/types";

/**
 * Hook de tempo real do painel administrativo.
 * Escuta INSERT e UPDATE na tabela `orders` via Supabase Realtime.
 * O painel nunca precisa ser atualizado manualmente.
 */
export function useRealtimeOrders(
  supabase: SupabaseClient | null,
  fetchOrders: () => Promise<void>
) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void fetchOrders();
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, fetchOrders]);

  return { connected };
}
