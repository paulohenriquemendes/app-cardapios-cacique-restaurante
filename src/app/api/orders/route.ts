import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Order,
  OrderItemSnapshot,
  OrderPayload,
  OrderPayloadItem,
} from "@/types";

export const dynamic = "force-dynamic";

/**
 * =============================================================
 * POST /api/orders — criação de pedidos (somente no servidor)
 * =============================================================
 * Regras de segurança:
 *   1. O preço enviado pelo navegador é IGNORADO.
 *   2. Produtos e opções são consultados no banco e validados.
 *   3. O total é recalculado aqui, no servidor.
 *   4. Quantidades e mesa são validadas.
 *   5. Usa service role key (nunca exposta ao navegador).
 */

const MAX_ITEMS_PER_ORDER = 100;
const MAX_QUANTITY = 50;
const MAX_TABLE = 999;
const MAX_NOTES_LENGTH = 500;

interface ResolvedItem {
  productId: string;
  code: string | null;
  name: string;
  sizeLabel: string | null;
  basePrice: number;
  quantity: number;
  notes: string | null;
  // opções resolvidas contra o banco
  resolvedOptions: {
    optionName: string;
    valueName: string;
    priceModifier: number;
  }[];
  unitPrice: number;
  total: number;
}

export async function POST(request: Request) {
  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requisição inválida." },
      { status: 400 }
    );
  }

  // ---------- validação básica ----------
  const tableNumber = Number(payload?.tableNumber);
  if (
    !Number.isInteger(tableNumber) ||
    tableNumber < 1 ||
    tableNumber > MAX_TABLE
  ) {
    return NextResponse.json(
      { ok: false, error: "Mesa inválida. Escaneie o QR Code da mesa." },
      { status: 400 }
    );
  }

  const items = payload?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Seu pedido está vazio." },
      { status: 400 }
    );
  }
  if (items.length > MAX_ITEMS_PER_ORDER) {
    return NextResponse.json(
      { ok: false, error: "Pedido grande demais. Faça pedidos menores." },
      { status: 400 }
    );
  }

  const orderNotes = trimOrNull(payload?.notes, MAX_NOTES_LENGTH);

  const supabase = createAdminClient();
  const errors: string[] = [];
  const resolvedItems: ResolvedItem[] = [];

  // ---------- validação por item ----------
  for (const raw of items as OrderPayloadItem[]) {
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      errors.push("Quantidade inválida em um dos itens.");
      break;
    }
    if (!raw?.productId || typeof raw.productId !== "string") {
      errors.push("Produto inválido no pedido.");
      break;
    }

    // 1) produto existe e está ativo?
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", raw.productId)
      .eq("active", true)
      .single();

    if (!product) {
      errors.push("Um dos produtos não está mais disponível no cardápio.");
      break;
    }

    // 2) opções do produto no banco
    const { data: dbOptions } = await supabase
      .from("product_options")
      .select("*, product_option_values(*)")
      .eq("product_id", product.id)
      .order("sort_order");

    const optionList = dbOptions ?? [];

    const submitted = raw.options ?? {};
    const resolvedOptions: ResolvedItem["resolvedOptions"] = [];

    for (const opt of optionList) {
      const values = (opt.product_option_values ?? []) as {
        id: string;
        name: string;
        price_modifier: number;
      }[];
      const chosenIds = (submitted[opt.id] ?? []).filter(
        (id): id is string => typeof id === "string"
      );

      // ids enviados existem de fato nesta opção?
      const validValues = values.filter((v) => chosenIds.includes(v.id));

      if (validValues.length !== chosenIds.length) {
        errors.push(`Opção inválida em "${product.name}".`);
        break;
      }

      const count = validValues.length;
      const min = opt.required
        ? Math.max(opt.min_select, 1)
        : opt.min_select;
      const max = opt.required
        ? Math.max(opt.max_select, opt.min_select, 1)
        : opt.max_select;

      if (count < min) {
        errors.push(
          `"${product.name}": escolha ${min > 1 ? `pelo menos ${min} ` : "ao menos 1 "}${opt.name.toLowerCase()}.`
        );
        break;
      }
      if (max > 0 && count > max) {
        errors.push(
          `"${product.name}": escolha no máximo ${max} ${opt.name.toLowerCase()}.`
        );
        break;
      }

      for (const v of validValues) {
        resolvedOptions.push({
          optionName: opt.name,
          valueName: v.name,
          priceModifier: Number(v.price_modifier) || 0,
        });
      }
    }

    if (errors.length > 0) break;

    // 3) recalcula o preço unitário no servidor
    const basePrice = Number(product.price) || 0;
    const unitPrice =
      basePrice +
      resolvedOptions.reduce((sum, o) => sum + o.priceModifier, 0);
    const itemTotal = Math.round(unitPrice * quantity * 100) / 100;

    resolvedItems.push({
      productId: product.id,
      code: product.code,
      name: product.name,
      sizeLabel: product.size_label,
      basePrice,
      quantity,
      notes: trimOrNull(raw.notes, MAX_NOTES_LENGTH),
      resolvedOptions,
      unitPrice,
      total: itemTotal,
    });
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { ok: false, error: errors[0] },
      { status: 400 }
    );
  }

  // 4) total recalculado no servidor
  const total =
    Math.round(
      resolvedItems.reduce((sum, i) => sum + i.total, 0) * 100
    ) / 100;

  // 5) número único do pedido
  const { data: orderNumber, error: numberError } = await supabase.rpc(
    "next_order_number"
  );
  if (numberError || typeof orderNumber !== "number") {
    return NextResponse.json(
      { ok: false, error: "Não foi possível gerar o número do pedido." },
      { status: 500 }
    );
  }

  // 6) grava pedido + itens + opções
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      number: orderNumber,
      table_number: tableNumber,
      status: "NOVO",
      notes: orderNotes,
      total,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { ok: false, error: "Falha ao registrar o pedido. Tente novamente." },
      { status: 500 }
    );
  }

  const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      resolvedItems.map((item, idx) => ({
        order_id: order.id,
        product_id: item.productId,
        product_code: item.code,
        product_name: item.name,
        product_size: item.sizeLabel,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        notes: item.notes,
        total: item.total,
        sort_order: idx,
      }))
    )
    .select();

  if (itemsError || !insertedItems) {
    // limpa o pedido órfão para não gerar número desperdiçado visível
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { ok: false, error: "Falha ao registrar os itens do pedido." },
      { status: 500 }
    );
  }

  const optionsRows = resolvedItems.flatMap((item, idx) =>
    item.resolvedOptions.map((o) => ({
      order_item_id: insertedItems[idx].id,
      option_name: o.optionName,
      value_name: o.valueName,
      price_modifier: o.priceModifier,
    }))
  );

  if (optionsRows.length > 0) {
    const { error: optionsError } = await supabase
      .from("order_item_options")
      .insert(optionsRows);
    if (optionsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { ok: false, error: "Falha ao registrar as opções do pedido." },
        { status: 500 }
      );
    }
  }

  // 7) resposta com o pedido completo (snapshot)
  const orderItems: OrderItemSnapshot[] = insertedItems.map((it, idx) => ({
    id: it.id,
    product_code: it.product_code,
    product_name: it.product_name,
    product_size: it.product_size,
    unit_price: Number(it.unit_price),
    quantity: it.quantity,
    notes: it.notes,
    total: Number(it.total),
    order_item_options: resolvedItems[idx].resolvedOptions.map((o) => ({
      option_name: o.optionName,
      value_name: o.valueName,
      price_modifier: o.priceModifier,
    })),
  }));

  const fullOrder: Order = {
    id: order.id,
    number: order.number,
    table_number: order.table_number,
    status: order.status,
    notes: order.notes,
    total: Number(order.total),
    created_at: order.created_at,
    order_items: orderItems,
  };

  return NextResponse.json({ ok: true, order: fullOrder }, { status: 201 });
}

function trimOrNull(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}
