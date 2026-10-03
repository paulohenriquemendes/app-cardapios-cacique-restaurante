import { getMenuWithProducts } from "@/lib/menu";
import { MenuView } from "@/components/menu/MenuView";

export const revalidate = 60;

export const metadata = { title: "Refeições" };

export default async function RefeicoesPage() {
  const data = await getMenuWithProducts("refeicoes");

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-cacique-brown-soft">
        Cardápio indisponível. Verifique a configuração do Supabase.
      </main>
    );
  }

  return <MenuView menu={data.menu} categories={data.categories} />;
}
