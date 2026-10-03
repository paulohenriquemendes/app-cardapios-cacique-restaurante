import { OrderSuccessView } from "@/components/cart/OrderSuccessView";

export const metadata = { title: "Pedido confirmado" };

export default async function PedidoPage({
  params,
}: {
  params: { numero: string };
}) {
  const numero = Number(params.numero);
  return <OrderSuccessView numero={numero} />;
}
