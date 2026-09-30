"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Car, Heart, User, Settings, LogOut } from "lucide-react";
import styles from "./DashboardSidebar.module.css";

export default function DashboardSidebar({ initials, fullName, userRole }: { initials: string, fullName: string, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Botón para abrir en móvil */}
      <div className={styles.mobileToggle}>
        <button onClick={toggleSidebar} className={styles.hamburger}>
          <Menu size={24} />
          <span>Menú de usuario</span>
        </button>
      </div>

      {/* Overlay para cerrar en móvil */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.closeBtn} onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{fullName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <Link href="/mi-cuenta" className={`${styles.navItem} ${styles.active}`} onClick={() => setIsOpen(false)}>
            <Car size={18} /> Mis Vehículos
          </Link>
          <Link href="/favoritos" className={styles.navItem} onClick={() => setIsOpen(false)}>
            <Heart size={18} /> Favoritos
          </Link>
          <Link href="#" className={styles.navItem} onClick={() => setIsOpen(false)}>
            <User size={18} /> Mi Perfil
          </Link>
          <Link href="#" className={styles.navItem} onClick={() => setIsOpen(false)}>
            <Settings size={18} /> Configuración
          </Link>
        </nav>

        <div className={styles.logoutWrapper}>
          <Link href="/api/auth/signout" className={`${styles.navItem} ${styles.logout}`} onClick={() => setIsOpen(false)}>
            <LogOut size={18} /> Cerrar Sesión
          </Link>
        </div>
      </aside>
    </>
  );
}
