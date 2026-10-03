"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-cacique-gold/60 bg-cacique-brown">
          <span className="font-display text-2xl text-cacique-gold-soft">C</span>
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-cacique-brown">
          Painel Administrativo
        </h1>
        <p className="mt-1 text-sm text-cacique-brown-soft">Restaurante Cacique</p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-cacique-brown">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-cacique-brown focus:border-cacique-gold focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-cacique-brown">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-cacique-brown focus:border-cacique-gold focus:outline-none"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cacique-brown py-3 font-semibold text-cream-50 disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
