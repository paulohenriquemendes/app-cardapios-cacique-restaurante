"use client";

import { memo } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { ProductImage } from "./ProductImage";

/**
 * Card de produto — compacto, prioridade smartphone.
 * Tocar no card abre os detalhes (modal).
 */
export const ProductCard = memo(function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (product: Product) => void;
}) {
  const summary =
    product.description && product.description.length > 68
      ? product.description.slice(0, 68).trimEnd() + "…"
      : product.description;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="flex w-full items-stretch gap-4 rounded-xl border border-cream-300 bg-cream-50 p-3 text-left shadow-card transition hover:border-cacique-gold/50 hover:shadow-card-hover active:scale-[0.99]"
    >
      <ProductImage
        product={product}
        className="h-20 w-20 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold leading-tight text-cacique-brown">
            {product.name}
          </h3>
          {product.code && (
            <span className="shrink-0 text-[10px] font-medium text-cacique-gold">
              {product.code}
            </span>
          )}
        </div>
        {summary && (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-cacique-brown-soft">
            {summary}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div>
            {product.size_label && (
              <span className="text-[11px] text-cacique-brown-soft/80">
                {product.size_label}
              </span>
            )}
            <p className="font-display text-[15px] font-bold text-cacique-brown">
              {formatPrice(product.price)}
            </p>
          </div>
          <span className="rounded-lg bg-cacique-brown px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cream-50">
            + Adicionar
          </span>
        </div>
      </div>
    </button>
  );
});
