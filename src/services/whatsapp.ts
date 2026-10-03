import type { Order } from "@/types";

/**
 * =============================================================
 * Camada de notificação de pedidos — DESENLHADA da interface.
 * =============================================================
 * A interface (carrinho, telas) só chama sendOrderNotification(order).
 * O canal concreto fica isolado aqui e pode ser trocado sem
 * tocar no restante do sistema.
 *
 * PRIMEIRA VERSÃO (implementada): WhatsApp "click-to-chat".
 *   • Gera a mensagem do pedido automaticamente.
 *   • Abre o WhatsApp com o texto pré-preenchido (wa.me).
 *   • O número vem de variável de ambiente, nunca do código.
 *
 * VERSÃO FUTURA (arquitetura pronta): WhatsApp Business / Cloud API.
 *   • Basta implementar CloudApiChannel abaixo (envio automático
 *     via POST /v1/messages com token de servidor) e trocar a
 *     linha `export const channel = ...` — nenhuma tela precisa
 *     mudar, pois todas usam apenas sendOrderNotification().
 */

export interface OrderMessage {
  title: string;
  body: string;
}

/** Monta a mensagem de pedido no formato do restaurante */
export function buildOrderMessage(order: Order): OrderMessage {
  const lines: string[] = [
    `NOVO PEDIDO — RESTAURANTE CACIQUE`,
    ``,
    `Pedido: #${order.number}`,
    `Mesa: ${order.table_number}`,
    ``,
  ];

  for (const item of order.order_items ?? []) {
    lines.push(`${item.quantity}x ${item.product_name}`);
    for (const opt of item.order_item_options ?? []) {
      lines.push(`    • ${opt.option_name}: ${opt.value_name}`);
    }
    if (item.notes) {
      lines.push(`    Obs.: ${item.notes}`);
    }
  }

  lines.push(``);
  if (order.notes) {
    lines.push(`Observação geral: ${order.notes}`);
    lines.push(``);
  }
  lines.push(`Total: R$ ${order.total.toFixed(2).replace(".", ",")}`);

  return {
    title: `Pedido #${order.number}`,
    body: lines.join("\n"),
  };
}

/** Interface do canal de envio (fácil de trocar/extender) */
export interface OrderNotificationChannel {
  /** Envia (ou prepara) a notificação do pedido */
  send(order: Order): Promise<void>;
}

/**
 * Canal 1 — WhatsApp click-to-chat (primeira versão).
 * Abre o WhatsApp com a mensagem pré-preenchida.
 */
class WhatsAppClickToChatChannel implements OrderNotificationChannel {
  async send(order: Order): Promise<void> {
    const { body } = buildOrderMessage(order);
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const url = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(body)}`
      : `https://wa.me/?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener");
  }
}

/**
 * Canal 2 — WhatsApp Business Cloud API (preparado para o futuro).
 * Requer token de servidor e phone number id; implemente quando
 * o restaurante tiver a conta business verificada.
 */
export class CloudApiChannel implements OrderNotificationChannel {
  async send(_order: Order): Promise<void> {
    // Exemplo de implementação futura (servidor):
    // POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
    //   Authorization: Bearer ${WHATSAPP_TOKEN}  (variável de ambiente)
    //   { messaging_product: "whatsapp", to, type: "text", text: { body } }
    throw new Error(
      "CloudApiChannel ainda não configurado. Implemente com as credenciais do WhatsApp Business."
    );
  }
}

// Canal ativo — trocar aqui para mudar a integração inteira.
const channel: OrderNotificationChannel = new WhatsAppClickToChatChannel();

/** Ponto único de entrada usado pelas telas */
export async function sendOrderNotification(order: Order): Promise<void> {
  return channel.send(order);
}
