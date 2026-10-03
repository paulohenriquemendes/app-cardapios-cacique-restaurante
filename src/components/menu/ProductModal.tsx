"use client";

import { useEffect, useMemo, useState } from "react";
import { cartCount, cartItemUnitPrice, formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/useCart";
import type {
  Product,
  ProductOption,
  ProductOptionValue,
} from "@/types";
import { ProductImage } from "./ProductImage";

/**
 * Detalhes do produto: foto grande, descrição completa,
 * peso/volume, preço, opções (única/múltipla, obrigatória/opcional),
 * observação livre e quantidade.
 * Bloqueia o envio quando uma opção obrigatória não foi preenchida.
 */
export function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem, cart } = useCart();
  const options = product.options ?? [];

  const [selection, setSelection] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      options
        .filter((o) => o.selection_type === "single" && o.required)
        .map((o) => [o.id, []])
    )
  );
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // fecha com ESC / bloqueia rolagem do fundo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isComplete = useMemo(
    () =>
      options.every((opt) => {
        const chosen = selection[opt.id] ?? [];
        const min = opt.required ? Math.max(opt.min_select, 1) : opt.min_select;
        const max = opt.required
          ? Math.max(opt.max_select, opt.min_select, 1)
          : opt.max_select;
        if (chosen.length < min) return false;
        if (max > 0 && chosen.length > max) return false;
        return true;
      }),
    [options, selection]
  );

  const chosenValues = useMemo(() => {
    const valueById = new Map<string, ProductOptionValue>();
    for (const opt of options) {
      for (const v of opt.values ?? []) valueById.set(v.id, v);
    }
    return options.flatMap((opt) =>
      (selection[opt.id] ?? []).map((valueId) => {
        const value = valueById.get(valueId);
        return {
          optionId: opt.id,
          optionName: opt.name,
          valueId,
          valueName: value?.name ?? "",
          priceModifier: Number(value?.price_modifier ?? 0),
        };
      })
    );
  }, [options, selection]);

  const unitPrice =
    product.price + chosenValues.reduce((sum, v) => sum + v.priceModifier, 0);
  const total = unitPrice * quantity;

  function toggleValue(opt: ProductOption, valueId: string) {
    setSelection((prev) => {
      const chosen = prev[opt.id] ?? [];
      if (opt.selection_type === "single") {
        return { ...prev, [opt.id]: [valueId] };
      }
      if (chosen.includes(valueId)) {
        return { ...prev, [opt.id]: chosen.filter((v) => v !== valueId) };
      }
      const max = opt.required
        ? Math.max(opt.max_select, opt.min_select, 1)
        : opt.max_select;
      if (max > 0 && chosen.length >= max) {
        // substitui o mais antigo quando atinge o máximo
        return { ...prev, [opt.id]: [...chosen.slice(1), valueId] };
      }
      return { ...prev, [opt.id]: [...chosen, valueId] };
    });
    setError(null);
  }

  function handleAdd() {
    if (!isComplete) {
      const missing = options.find((opt) => {
        const chosen = (selection[opt.id] ?? []).length;
        const min = opt.required
          ? Math.max(opt.min_select, 1)
          : opt.min_select;
        return chosen < min;
      });
      setError(
        missing
          ? `Escolha ${missing.min_select > 1 ? `${missing.min_select} ` : ""}${missing.name.toLowerCase()} antes de adicionar.`
          : "Complete as opções obrigatórias."
      );
      return;
    }
    addItem(
      {
        productId: product.id,
        productCode: product.code,
        name: product.name,
        sizeLabel: product.size_label,
        basePrice: product.price,
        notes: notes.trim() || null,
        options: chosenValues,
      },
      quantity
    );
    onClose();
  }

  const currentCount = cartCount(cart.items);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-2xl bg-cream-50 shadow-2xl sm:animate-fade-in sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* foto grande */}
        <div className="relative">
          <ProductImage product={product} className="h-52 w-full rounded-t-2xl" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-28 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl text-cacique-brown">
              {product.name}
            </h2>
            {product.code && (
              <span className="shrink-0 rounded bg-cream-200 px-2 py-0.5 text-xs font-medium text-cacique-gold">
                {product.code}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-2 text-sm leading-relaxed text-cacique-brown-soft">
              {product.description}
            </p>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            {product.size_label && (
              <span className="text-xs uppercase tracking-wide text-cacique-brown-soft/80">
                {product.size_label}
              </span>
            )}
            <p className="font-display text-xl font-bold text-cacique-brown">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* opções */}
          {options.map((opt) => {
            const chosen = selection[opt.id] ?? [];
            return (
              <fieldset key={opt.id} className="mt-5">
                <legend className="flex w-full flex-wrap items-center gap-2">
                  <span className="font-display text-base font-semibold text-cacique-brown">
                    {opt.name}
                  </span>
                  {opt.required ? (
                    <span className="rounded-full bg-cacique-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cacique-gold">
                      Obrigatório
                    </span>
                  ) : (
                    <span className="text-[11px] text-cacique-brown-soft/70">
                      opcional
                    </span>
                  )}
                  {opt.min_select > 1 && (
                    <span className="text-[11px] text-cacique-brown-soft">
                      escolha {opt.min_select}
                      {opt.max_select > opt.min_select ? ` a ${opt.max_select}` : ""}
                    </span>
                  )}
                  {opt.selection_type === "multiple" && opt.min_select <= 1 && (
                    <span className="text-[11px] text-cacique-brown-soft">
                      até {opt.max_select}
                    </span>
                  )}
                </legend>

                <div className="mt-2 space-y-1.5">
                  {(opt.values ?? []).map((value) => {
                    const checked = chosen.includes(value.id);
                    return (
                      <label
                        key={value.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition ${
                          checked
                            ? "border-cacique-gold bg-cacique-gold/10"
                            : "border-cream-300 bg-cream-100 hover:border-cacique-gold/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type={
                              opt.selection_type === "single" ? "radio" : "checkbox"
                            }
                            name={`opt-${opt.id}`}
                            checked={checked}
                            onChange={() => toggleValue(opt, value.id)}
                            className="h-4 w-4 accent-cacique-gold"
                          />
                          <span className="text-cacique-brown">{value.name}</span>
                        </span>
                        {Number(value.price_modifier) > 0 && (
                          <span className="text-xs font-semibold text-cacique-brown-soft">
                            + {formatPrice(Number(value.price_modifier))}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {/* observação */}
          <div className="mt-5">
            <label
              htmlFor="product-notes"
              className="font-display text-base font-semibold text-cacique-brown"
            >
              Observação
            </label>
            <textarea
              id="product-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ex.: sem tomate, pouco molho, carne bem passada…"
              className="mt-2 w-full resize-none rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm text-cacique-brown placeholder:text-cacique-brown-soft/50 focus:border-cacique-gold focus:outline-none"
            />
          </div>

          {/* quantidade */}
          <div className="mt-5 flex items-center justify-between">
            <span className="font-display text-base font-semibold text-cacique-brown">
              Quantidade
            </span>
            <div className="flex items-center gap-3 rounded-lg border border-cream-300 bg-cream-100 px-2 py-1">
              <button
                type="button"
                aria-label="Diminuir"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded text-lg font-bold text-cacique-brown-soft active:bg-cream-200"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-cacique-brown">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded text-lg font-bold text-cacique-brown-soft active:bg-cream-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* barra de ação fixa do modal */}
        <div className="sticky bottom-0 border-t border-cream-300 bg-cream-50/95 px-5 py-3 backdrop-blur">
          {error && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="flex w-full items-center justify-between rounded-xl bg-cacique-brown px-4 py-3.5 font-semibold text-cream-50 transition active:scale-[0.99] disabled:opacity-60"
          >
            <span className="text-sm">
              Adicionar ao pedido
              {currentCount > 0 && ` (${currentCount} itens)`}
            </span>
            <span className="font-display text-lg">{formatPrice(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
