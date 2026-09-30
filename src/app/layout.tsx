import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getServerSession } from "next-auth/next";
import { GET, POST } from "@/app/api/auth/[...nextauth]/route";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtenemos la sesión del servidor para saber si está logueado
  // Nota temporal: Para Vercel usaremos la lógica básica por ahora
  let session = null;
  try {
    // Attempt to get session (might fail silently on build time if env is not configured)
    session = await getServerSession();
  } catch (e) {
    console.error(e);
  }

  return (
    <html lang="es">
      <body className={`${manrope.className} ${playfair.variable} ${manrope.variable}`}>
        <Header session={session} />

        <main className={styles.mainContent}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={`container ${styles.footerContainer}`}>
            <p>&copy; {new Date().getFullYear()} Autos del Patrón. Todos los derechos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
