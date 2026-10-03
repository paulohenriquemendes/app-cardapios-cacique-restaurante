"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CategoryWithProducts, Menu, MenuSlug, Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { CartBar } from "@/components/cart/CartBar";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

/**
 * Tela completa do cardápio (cliente):
 * busca por nome/código/categoria, navegação por categorias,
 * cards, modal de detalhes e barra do carrinho.
 */
export function MenuView({
  menu,
  categories,
  mesa,
}: {
  menu: Menu;
  categories: CategoryWithProducts[];
  mesa?: number;
}) {
  const { setMenuSlug, setTableNumber } = useCart();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const menuSlug = menu.slug as MenuSlug;

  useEffect(() => {
    setMenuSlug(menuSlug);
    if (mesa) setTableNumber(mesa);
  }, [menuSlug, mesa, setMenuSlug, setTableNumber]);

  // busca rápida: nome, código e categoria
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.code ?? "").toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [categories, search]);

  const searching = search.trim().length > 0;

  return (
    <div className="min-h-dvh pb-28">
      {/* cabeçalho */}
      <header className="sticky top-0 z-30 border-b border-cacique-gold/20 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto max-w-md px-4 pt-3">
          <div className="flex items-center justify-between">
            <Link href={mesa ? `/mesa/${mesa}` : "/"} className="flex items-center gap-2 text-cacique-brown-soft">
              <span aria-hidden>←</span>
              <span className="text-xs uppercase tracking-widest">Cacique</span>
            </Link>
            {mesa ? (
              <span className="rounded-full border border-cacique-gold/40 bg-cacique-gold/10 px-3 py-1 text-xs font-bold text-cacique-brown">
                Mesa {mesa}
              </span>
            ) : null}
            <Link
              href={menuSlug === "cafe-da-manha"
                ? (mesa ? `/mesa/${mesa}/refeicoes` : "/refeicoes")
                : (mesa ? `/mesa/${mesa}/cafe-da-manha` : "/cafe-da-manha")}
              className="text-xs font-semibold text-cacique-gold"
            >
              {menuSlug === "cafe-da-manha" ? "🍽️ Refeições" : "☕ Café da Manhã"}
            </Link>
          </div>

          <h1 className="mt-2 font-display text-2xl font-bold text-cacique-brown">
            {menu.name}
          </h1>

          {/* busca */}
          <div className="relative mt-3 pb-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto, código ou categoria…"
              className="w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 pl-10 text-sm text-cacique-brown placeholder:text-cacique-brown-soft/50 focus:border-cacique-gold focus:outline-none"
              aria-label="Buscar no cardápio"
            />
            <span className="pointer-events-none absolute left-3.5 top-2.5 text-sm text-cacique-brown-soft/60" aria-hidden>
              🔍
            </span>
          </div>
        </div>

        {/* navegação por categorias */}
        {!searching && categories.length > 1 && (
          <nav className="overflow-x-auto whitespace-nowrap px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#categoria-${cat.id}`}
                className="mr-2 inline-block rounded-full border border-cream-300 bg-cream-50 px-3.5 py-1.5 text-xs font-medium text-cacique-brown-soft transition hover:border-cacique-gold/50 hover:text-cacique-brown"
              >
                {cat.name}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* lista */}
      <main className="mx-auto max-w-md px-4 pt-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-cacique-brown-soft">
              Nenhum item encontrado para “{search}”.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 text-sm font-semibold text-cacique-gold"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          filtered.map((cat) => (
            <section key={cat.id} id={`categoria-${cat.id}`} className="scroll-mt-36 pt-6">
              <div className="divider-ornament">
                <span aria-hidden>✻</span>
              </div>
              <h2 className="mt-3 text-center font-display text-xl font-bold uppercase tracking-wider text-cacique-brown">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mx-auto mt-1 max-w-xs text-center text-[11px] leading-snug text-cacique-brown-soft/80">
                  {cat.description}
                </p>
              )}
              <div className="mt-4 space-y-3">
                {cat.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        <footer className="mt-10 text-center text-[11px] leading-relaxed text-cacique-brown-soft/70">
          Restaurante Cacique / Cozinha Regional
          <br />
          Empresa familiar entre a Capital e o interior do Ceará
        </footer>
      </main>

      <CartBar mesa={mesa} />

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
