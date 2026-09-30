import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { GET, POST } from "@/app/api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <header className={styles.header}>
          <div className={`container ${styles.headerContainer}`}>
            <div className={styles.logo}>
              <Link href="/">
                <span className={styles.logoAccent}>Autos</span> del Patrón
              </Link>
            </div>
            
            <nav className={styles.navDesktop}>
              <Link href="/" className={styles.navLink}>Inicio</Link>
              <Link href="/vehiculos" className={styles.navLink}>Comprar vehículos</Link>
              <Link href="/favoritos" className={styles.navLink}>Favoritos</Link>
            </nav>

            <div className={styles.actions}>
              {session ? (
                <Link href="/mi-cuenta" className={styles.loginLink}>
                  Mi Cuenta
                </Link>
              ) : (
                <Link href="/login" className={styles.loginLink}>
                  Iniciar sesión
                </Link>
              )}
              <Link href="/publicar" className="btn-primary">
                Publicar vehículo
              </Link>
            </div>
          </div>
        </header>

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
