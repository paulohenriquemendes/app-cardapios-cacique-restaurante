import type {
  Order,
  OrderCreatedResponse,
  OrderErrorResponse,
  OrderPayload,
} from "@/types";

/**
 * Serviço de pedidos (lado cliente).
 * A criação chama a rota de API /api/orders, que valida,
 * consulta os preços atuais no banco e recalcula o total.
 * O navegador NUNCA envia nem define preços.
 */

export async function placeOrder(
  payload: OrderPayload
): Promise<OrderCreatedResponse> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as OrderCreatedResponse | OrderErrorResponse;

  if (!res.ok || !json.ok) {
    throw new Error(
      "error" in json ? json.error : "Não foi possível enviar o pedido."
    );
  }
  return json;
}

export async function updateOrderStatus(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  orderId: string,
  status: Order["status"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}
