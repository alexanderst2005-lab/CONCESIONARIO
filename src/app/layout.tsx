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

        <footer className={styles.footer} style={{ backgroundColor: "#050505", borderTop: "1px solid #111", padding: "4rem 0 2rem 0", marginTop: "auto" }}>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <h3 className="serif-title" style={{ color: "white", fontSize: "1.5rem", marginBottom: "1rem" }}>AUTOS DEL PATRÓN</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: "1.6" }}>Concesionario digital premium. Vehículos seleccionados y garantizados para los más exigentes.</p>
            </div>
            <div>
              <h4 style={{ color: "white", marginBottom: "1rem", letterSpacing: "1px", fontSize: "0.9rem" }}>ENLACES</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li><Link href="/vehiculos" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">Vehículos</Link></li>
                <li><Link href="/vehiculos" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">Marcas</Link></li>
                <li><Link href="/publicar" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">Publicar vehículo</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: "white", marginBottom: "1rem", letterSpacing: "1px", fontSize: "0.9rem" }}>SOPORTE</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <li><Link href="#" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">Contacto</Link></li>
                <li><a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">WhatsApp</a></li>
                <li><Link href="#" style={{ color: "#888", textDecoration: "none", transition: "color 0.2s" }} className="hover-gold">Políticas de uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ borderTop: "1px solid #111", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>&copy; {new Date().getFullYear()} Autos del Patrón. Todos los derechos reservados.</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {/* Redes sociales (Iconos simulados) */}
              <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "white", textDecoration: "none" }}>Ig</a>
              <a href="#" style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "white", textDecoration: "none" }}>Fb</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
