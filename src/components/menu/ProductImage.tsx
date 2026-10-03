import type { Product } from "@/types";

/**
 * Foto do produto.
 * Quando não há fotografia real cadastrada (image_url vazio),
 * mostra um marcador elegante — NUNCA uma foto genérica
 * apresentada como se fosse o prato real do restaurante.
 * Quando o restaurante enviar as fotos (Supabase Storage),
 * elas aparecem aqui automaticamente, sem mudar o cadastro.
 */
export function ProductImage({
  product,
  className = "",
}: {
  product: Pick<Product, "image_url" | "name">;
  className?: string;
}) {
  if (product.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  const initial = product.name.trim().charAt(0).toUpperCase();
  return (
    <div
      role="img"
      aria-label={`Foto de ${product.name} (em breve)`}
      className={`flex items-center justify-center bg-gradient-to-br from-cream-200 to-cream-300 ${className}`}
    >
      <span className="font-display text-2xl text-cacique-gold/70">
        {initial}
      </span>
    </div>
  );
}
