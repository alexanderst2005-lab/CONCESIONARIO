import React from "react";
import Header from "@/components/Header";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./layout.module.css";
import Link from "next/link";
import Image from "next/image";

import RequirePhoneModal from "@/components/RequirePhoneModal";
import CookieTrigger from "@/components/CookieTrigger";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error(e);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header session={session} />
      <RequirePhoneModal session={session} />
      <main className={styles.mainContent} style={{ flex: 1 }}>
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
              <li><Link href="/vehiculos" style={{ color: "#888", textDecoration: "none" }}>Vehículos</Link></li>
              <li><Link href="/login" style={{ color: "#888", textDecoration: "none" }}>Vender mi auto</Link></li>
              <li><Link href="/contacto" style={{ color: "#888", textDecoration: "none" }}>Contacto</Link></li>
              <li><CookieTrigger /></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ borderTop: "1px solid #111", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "0.85rem" }}>
          <p>&copy; {new Date().getFullYear()} Autos del Patrón. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
