import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Cliente Supabase com SERVICE ROLE KEY.
 * ⚠️ Somente em código que roda no SERVIDOR (route handlers,
 * server components). Ignora RLS — usado pela API de pedidos
 * para gravar pedidos com validação e recálculo server-side.
 * NUNCA importe este arquivo em um componente de cliente.
 */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return cached;
}
