import { getMenuWithProducts } from "@/lib/menu";
import { MenuView } from "@/components/menu/MenuView";

export const revalidate = 60;

export const metadata = { title: "Café da Manhã" };

export default async function CafeDaManhaPage() {
  const data = await getMenuWithProducts("cafe-da-manha");

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-cacique-brown-soft">
        Cardápio indisponível. Verifique a configuração do Supabase.
      </main>
    );
  }

  return <MenuView menu={data.menu} categories={data.categories} />;
}
