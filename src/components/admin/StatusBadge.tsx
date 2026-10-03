import type { OrderStatus } from "@/types";

const STYLES: Record<OrderStatus, string> = {
  NOVO: "bg-cacique-gold text-cacique-brown-dark",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  EM_PREPARO: "bg-amber-100 text-amber-800",
  PRONTO: "bg-emerald-100 text-emerald-800",
  FINALIZADO: "bg-cream-300 text-cacique-brown-soft",
  CANCELADO: "bg-red-100 text-red-700",
};

const LABELS: Record<OrderStatus, string> = {
  NOVO: "NOVO",
  CONFIRMADO: "CONFIRMADO",
  EM_PREPARO: "EM PREPARO",
  PRONTO: "PRONTO",
  FINALIZADO: "FINALIZADO",
  CANCELADO: "CANCELADO",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

export const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  NOVO: "Confirmar",
  CONFIRMADO: "Em preparo",
  EM_PREPARO: "Pronto",
  PRONTO: "Finalizar",
};
