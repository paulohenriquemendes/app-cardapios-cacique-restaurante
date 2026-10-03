import Link from "next/link";
import { MENUS } from "@/lib/constants";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";

/**
 * Tela inicial: "Escolha seu cardápio".
 * O QR Code da mesa aponta para /mesa/[n]; se o cliente abrir a
 * raiz, escolhe o cardápio e a mesa fica em branco até o momento
 * de confirmar o pedido (modo demonstração).
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 py-12">
      {/* marca */}
      <div className="mt-10 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-cacique-gold/60 bg-cacique-brown shadow-card">
          <span className="font-display text-4xl text-cacique-gold-soft">C</span>
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-wide text-cacique-brown">
          {RESTAURANT_NAME}
        </h1>
        <p className="mt-1 text-sm uppercase tracking-[0.3em] text-cacique-brown-soft">
          {RESTAURANT_TAGLINE}
        </p>
        <div className="divider-ornament mt-6">
          <span aria-hidden>✻</span>
        </div>
      </div>

      <p className="mt-8 text-center font-display text-xl">Escolha seu cardápio:</p>

      {/* cardápios */}
      <div className="mt-6 w-full space-y-5">
        <Link
          href="/cafe-da-manha"
          className="block rounded-2xl border border-cacique-gold/30 bg-cream-50 p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-cacique-gold hover:shadow-card-hover active:translate-y-0"
        >
          <span className="text-4xl" aria-hidden>
            ☕
          </span>
          <h2 className="mt-3 font-display text-2xl text-cacique-brown">
            CAFÉ DA MANHÃ
          </h2>
          <p className="mt-1 text-xs text-cacique-brown-soft">
            Café regional, tapiocas, sanduíches e cafés especiais
          </p>
        </Link>

        <Link
          href="/refeicoes"
          className="block rounded-2xl border border-cacique-gold/30 bg-cream-50 p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-cacique-gold hover:shadow-card-hover active:translate-y-0"
        >
          <span className="text-4xl" aria-hidden>
            🍽️
          </span>
          <h2 className="mt-3 font-display text-2xl text-cacique-brown">
            REFEIÇÕES
          </h2>
          <p className="mt-1 text-xs text-cacique-brown-soft">
            Menu sertanejo, carnes na brasa e pratos executivos
          </p>
        </Link>
      </div>

      <p className="mt-auto pt-10 text-center text-xs text-cacique-brown-soft/70">
        Empresa familiar • Autenticidade da culinária regional
      </p>
    </main>
  );
}
