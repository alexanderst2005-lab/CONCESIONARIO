"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, X, Car, Heart, User, Clock, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./DashboardSidebar.module.css";

export default function DashboardSidebar({ initials, fullName, userRole }: { initials: string, fullName: string, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "publicaciones";

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{fullName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <Link href="/mi-cuenta?tab=historial" className={`${styles.navItem} ${currentTab === 'historial' ? styles.active : ''}`}>
            <Clock size={18} /> Historial
          </Link>
          <Link href="/favoritos" className={styles.navItem}>
            <Heart size={18} /> Favoritos
          </Link>
          <Link href="/mi-cuenta?tab=publicaciones" className={`${styles.navItem} ${currentTab === 'publicaciones' ? styles.active : ''}`}>
            <Car size={18} /> Mis Publicaciones
          </Link>
          <Link href="/mi-cuenta?tab=perfil" className={`${styles.navItem} ${currentTab === 'perfil' ? styles.active : ''}`}>
            <User size={18} /> Mi Perfil
          </Link>
        </nav>

        <div className={styles.navBottom}>
          <button 
            className={styles.logoutBtn} 
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
