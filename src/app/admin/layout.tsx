import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = { title: "Painel de Pedidos" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-cream-100">
      <AdminHeader />
      {children}
    </div>
  );
}
