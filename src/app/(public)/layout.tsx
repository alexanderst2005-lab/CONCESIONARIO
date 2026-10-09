import React from "react";
import Header from "@/components/Header";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./layout.module.css";
import Link from "next/link";
import Image from "next/image";


import CookieTrigger from "@/components/CookieTrigger";

export const dynamic = 'force-dynamic';

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

  const IS_MAINTENANCE_MODE = true; // TODO: Cambiar a false para desactivar el mantenimiento

  if (IS_MAINTENANCE_MODE) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#050505", color: "#fff", alignItems: "center", justifyContent: "center", padding: "2rem", backgroundImage: "radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)" }}>
        <div style={{ 
          background: "rgba(20, 20, 20, 0.6)", 
          backdropFilter: "blur(10px)", 
          padding: "3rem", 
          borderRadius: "16px", 
          border: "1px solid rgba(205, 164, 52, 0.2)",
          textAlign: "center",
          maxWidth: "500px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--gold-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "1.2rem" }}>⏱</span>
            </div>
          </div>
          <h1 className="serif-title" style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "var(--gold-accent)", letterSpacing: "0.5px" }}>Mantenimiento</h1>
          <p style={{ fontSize: "0.95rem", color: "#aaa", lineHeight: "1.6", margin: 0, fontWeight: 300 }}>
            Nuestra plataforma está recibiendo algunas mejoras de sistema.<br />Volveremos en breve con una experiencia aún más exclusiva.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header session={session} />
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
