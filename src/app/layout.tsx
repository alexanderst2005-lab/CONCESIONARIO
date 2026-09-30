import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <header className={styles.header}>
          <div className={`container ${styles.headerContainer}`}>
            <div className={styles.logo}>
              {/* Logo text instead of image for now */}
              <a href="/">
                <span className={styles.logoAccent}>Autos</span> del Patrón
              </a>
            </div>
            
            <nav className={styles.navDesktop}>
              <a href="/" className={styles.navLink}>Inicio</a>
              <a href="/vehiculos" className={styles.navLink}>Comprar vehículos</a>
              <a href="/favoritos" className={styles.navLink}>Favoritos</a>
            </nav>

            <div className={styles.actions}>
              <a href="/login" className={styles.loginLink}>Iniciar sesión</a>
              <a href="/publicar" className="btn-primary">Publicar vehículo</a>
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
