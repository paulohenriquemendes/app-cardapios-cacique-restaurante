import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Category,
  CategoryWithProducts,
  Menu,
  Product,
  ProductOption,
  ProductOptionValue,
} from "@/types";

/**
 * Camada de acesso ao cardápio (server-side).
 * O cardápio é público (RLS permite leitura com anon key),
 * mas a leitura pelo servidor é mais rápida para o primeiro
 * carregamento da página.
 */

export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null; // Supabase não configurado (env ausente)
  }
  const { data } = await supabase
    .from("menus")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return (data as Menu) ?? null;
}

export async function getCategories(menuId: string): Promise<Category[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return [];
  }
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("menu_id", menuId)
    .eq("active", true)
    .order("sort_order");
  return (data as Category[]) ?? [];
}

export async function getProducts(menuId: string): Promise<Product[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return [];
  }
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("menu_id", menuId)
    .eq("active", true)
    .order("sort_order");
  return (data as Product[]) ?? [];
}

export async function getOptionsForProducts(
  productIds: string[]
): Promise<Map<string, ProductOption[]>> {
  const map = new Map<string, ProductOption[]>();
  if (productIds.length === 0) return map;
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return map;
  }

  const { data: options } = await supabase
    .from("product_options")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order");

  if (!options || options.length === 0) return map;

  const { data: values } = await supabase
    .from("product_option_values")
    .select("*")
    .in(
      "option_id",
      options.map((o) => o.id)
    )
    .order("sort_order");

  const valuesByOption = new Map<string, ProductOptionValue[]>();
  for (const v of (values as ProductOptionValue[]) ?? []) {
    const list = valuesByOption.get(v.option_id) ?? [];
    list.push(v);
    valuesByOption.set(v.option_id, list);
  }

  for (const o of options as ProductOption[]) {
    const list = map.get(o.product_id) ?? [];
    list.push({ ...o, values: valuesByOption.get(o.id) ?? [] });
    map.set(o.product_id, list);
  }
  return map;
}

/**
 * Cardápio completo de um menu, agrupado por categoria,
 * com as opções de cada produto já resolvidas.
 */
export async function getMenuWithProducts(
  menuSlug: string
): Promise<{ menu: Menu; categories: CategoryWithProducts[] } | null> {
  const menu = await getMenuBySlug(menuSlug);
  if (!menu) return null;

  const [categories, products] = await Promise.all([
    getCategories(menu.id),
    getProducts(menu.id),
  ]);

  const optionsMap = await getOptionsForProducts(
    products.map((p) => p.id)
  );

  const productsByCategory = new Map<string, Product[]>();
  for (const p of products) {
    const list = productsByCategory.get(p.category_id) ?? [];
    list.push({ ...p, options: optionsMap.get(p.id) ?? [] });
    productsByCategory.set(p.category_id, list);
  }

  return {
    menu,
    categories: categories.map((c) => ({
      ...c,
      products: productsByCategory.get(c.id) ?? [],
    })),
  };
}
