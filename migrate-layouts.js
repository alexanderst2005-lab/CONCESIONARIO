const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src/app');
const publicDir = path.join(appDir, '(public)');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Files and folders to move to (public)
const toMove = [
  'login',
  'mi-cuenta',
  'publicar',
  'registro',
  'vehiculo',
  'vehiculos',
  'page.tsx',
  'page.module.css',
  'layout.module.css'
];

for (const item of toMove) {
  const oldPath = path.join(appDir, item);
  const newPath = path.join(publicDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
}

// Now read the original layout.tsx and extract the Header/Footer part into (public)/layout.tsx
// But it's easier to just write them explicitly.

const rootLayoutContent = `import type { Metadata } from "next";
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
      <body className={\`\${manrope.className} \${playfair.variable} \${manrope.variable}\`}>
        {children}
      </body>
    </html>
  );
}
`;

fs.writeFileSync(path.join(appDir, 'layout.tsx'), rootLayoutContent);

const publicLayoutContent = `import React from "react";
import Header from "@/components/Header";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import styles from "./layout.module.css";
import Link from "next/link";
import Image from "next/image";

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
`;

fs.writeFileSync(path.join(publicDir, 'layout.tsx'), publicLayoutContent);

console.log("Restructured to Route Groups successfully.");
