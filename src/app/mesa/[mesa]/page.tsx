import Link from "next/link";
import { notFound } from "next/navigation";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";

/**
 * Destino do QR Code da mesa: /mesa/01 … /mesa/20.
 * O número da mesa é identificado pela URL — o cliente nunca digita nada.
 */
export default async function MesaPage({
  params,
}: {
  params: { mesa: string };
}) {
  const mesa = Number(params.mesa);
  if (!Number.isInteger(mesa) || mesa < 1 || mesa > 999) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 py-12">
      <div className="mt-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-cacique-gold/60 bg-cacique-brown shadow-card">
          <span className="font-display text-3xl text-cacique-gold-soft">C</span>
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-cacique-brown">
          {RESTAURANT_NAME}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-cacique-brown-soft">
          {RESTAURANT_TAGLINE}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cacique-gold/40 bg-cacique-gold/10 px-5 py-2">
          <span className="text-sm text-cacique-brown-soft">Sua mesa:</span>
          <span className="font-display text-2xl font-bold text-cacique-brown">
            {mesa}
          </span>
        </div>
      </div>

      <p className="mt-8 text-center font-display text-xl text-cacique-brown">
        Escolha seu cardápio:
      </p>

      <div className="mt-6 w-full space-y-5">
        <Link
          href={`/mesa/${mesa}/cafe-da-manha`}
          className="block rounded-2xl border border-cacique-gold/30 bg-cream-50 p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-cacique-gold hover:shadow-card-hover active:translate-y-0"
        >
          <span className="text-4xl" aria-hidden>☕</span>
          <h2 className="mt-3 font-display text-2xl text-cacique-brown">CAFÉ DA MANHÃ</h2>
        </Link>
        <Link
          href={`/mesa/${mesa}/refeicoes`}
          className="block rounded-2xl border border-cacique-gold/30 bg-cream-50 p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:border-cacique-gold hover:shadow-card-hover active:translate-y-0"
        >
          <span className="text-4xl" aria-hidden>🍽️</span>
          <h2 className="mt-3 font-display text-2xl text-cacique-brown">REFEIÇÕES</h2>
        </Link>
      </div>

      <p className="mt-auto pt-10 text-center text-xs text-cacique-brown-soft/70">
        Escaneado pelo QR Code da mesa {mesa}
      </p>
    </main>
  );
}
