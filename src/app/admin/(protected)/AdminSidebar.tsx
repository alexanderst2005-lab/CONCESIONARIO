"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, Car, Tags, Users, MessageSquare, ListTree, Settings, FileText, Building } from "lucide-react";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Vehículos", href: "/admin/vehiculos", icon: <Car size={18} /> },
    { name: "Marcas", href: "/admin/marcas", icon: <Tags size={18} /> },
    { name: "Tipos de Vehículo", href: "/admin/categorias", icon: <ListTree size={18} /> },
    { name: "Bancos / Financiación", href: "/admin/financiacion/bancos", icon: <Building size={18} /> },
    { name: "Planes Promoción", href: "/admin/promociones/planes", icon: <Tags size={18} /> },
    { name: "Suscripciones", href: "/admin/promociones/suscripciones", icon: <MessageSquare size={18} /> },
  ];

  return (
    <>
      <button className={styles.mobileToggle} onClick={() => setIsOpen(true)}>
        <Menu size={24} /> <span>Menú Admin</span>
      </button>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        <div className={styles.adminHeader}>
          <div className={styles.logoAccent}>Panel Admin</div>
          <p className={styles.adminRole}>Super Administrador</p>
        </div>
        
        <nav className={styles.navMenu}>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
          <button 
            onClick={() => signOut({ callbackUrl: '/admin/login' })} 
            className={styles.navItem}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "#f87171" }}
          >
            <Settings size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
