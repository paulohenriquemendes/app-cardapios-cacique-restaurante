"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-cacique-gold/20 bg-cacique-brown text-cream-50">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-display text-lg font-bold">Pedidos — Cacique</h1>
          <p className="text-[11px] uppercase tracking-widest text-cream-300/70">
            Painel administrativo
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-cream-50/25 px-3 py-1.5 text-xs font-semibold text-cream-50 transition hover:bg-cream-50/10"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
