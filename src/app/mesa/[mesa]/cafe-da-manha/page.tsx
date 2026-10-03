import { getMenuWithProducts } from "@/lib/menu";
import { MenuView } from "@/components/menu/MenuView";

export const revalidate = 60;
export const metadata = { title: "Café da Manhã" };

export default async function MesaCafePage({
  params,
}: {
  params: { mesa: string };
}) {
  const mesa = Number(params.mesa);
  if (!Number.isInteger(mesa) || mesa < 1 || mesa > 999) {
    return <main />;
  }
  const data = await getMenuWithProducts("cafe-da-manha");
  if (!data) return <main />;
  return <MenuView menu={data.menu} categories={data.categories} mesa={mesa} />;
}
