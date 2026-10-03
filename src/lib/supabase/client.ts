"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseBrowserClient = SupabaseClient;

/**
 * Cliente Supabase para o NAVEGADOR.
 * Usa apenas a anon key — leitura pública do cardápio (RLS)
 * e sessão do painel administrativo.
 */
export function createClient(): SupabaseBrowserClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
