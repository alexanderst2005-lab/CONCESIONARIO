import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair',
});

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: "Autos del Patrón | Encuentra tu vehículo ideal",
  description: "Marketplace automotriz premium para compra y venta de vehículos en Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.className} ${playfair.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
