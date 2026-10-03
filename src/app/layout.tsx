import type { Metadata, Viewport } from "next";
import { Lora, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/hooks/useCart";
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from "@/lib/constants";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${RESTAURANT_NAME} — ${RESTAURANT_TAGLINE}`,
    template: `%s — ${RESTAURANT_NAME}`,
  },
  description:
    "Cardápio digital do Restaurante Cacique / Cozinha Regional. Escaneie o QR Code da sua mesa e faça seu pedido.",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#4A2C1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
