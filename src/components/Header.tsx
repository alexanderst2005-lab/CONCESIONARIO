"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({ session }: { session: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        
        {/* Hamburguesa (Solo Móvil) */}
        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menú">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Logo Centro (Móvil) / Izquierda (Desktop) */}
        <div className={styles.logo}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image 
              src="/logo.png" 
              alt="Autos del Patrón Logo" 
              width={140} 
              height={45} 
              style={{ objectFit: 'contain' }} 
              priority
            />
          </Link>
        </div>
        
        {/* Nav Desktop (solo visible en PC) */}
        <nav className={styles.navDesktop}>
          <Link href="/" className={styles.navLink}>INICIO</Link>
          <Link href="/vehiculos" className={styles.navLink}>VEHÍCULOS</Link>
          <Link href="/favoritos" className={styles.navLink}>FAVORITOS</Link>
        </nav>

        {/* Acciones Derecha (LOGIN y PUBLICAR) */}
        <div className={styles.actions}>
          <div className={styles.desktopActions}>
            <Link href="/publicar" className={`btn-primary ${styles.publishBtn}`}>
              PUBLICAR
            </Link>
          </div>
          
          {session ? (
            <Link href="/mi-cuenta" className={styles.loginLink} onClick={() => setMenuOpen(false)}>
              CUENTA
            </Link>
          ) : (
            <Link href="/login" className={styles.loginLink} onClick={() => setMenuOpen(false)}>
              LOGIN
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" onClick={toggleMenu} className={styles.mobileNavLink}>INICIO</Link>
          <Link href="/vehiculos" onClick={toggleMenu} className={styles.mobileNavLink}>VEHÍCULOS</Link>
          <Link href="/favoritos" onClick={toggleMenu} className={styles.mobileNavLink}>FAVORITOS</Link>
          <Link href="/publicar" onClick={toggleMenu} className={styles.mobileNavLink}>PUBLICAR VEHÍCULO</Link>
        </nav>
      </div>
    </header>
  );
}
