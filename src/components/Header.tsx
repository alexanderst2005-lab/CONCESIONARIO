"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Crown } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({ session }: { session: any }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <div className={styles.accountDropdownWrapper} ref={dropdownRef}>
              <button 
                className={styles.loginLink} 
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                MI CUENTA
              </button>

              {accountDropdownOpen && (
                <div className={styles.accountDropdown}>
                  <Link href="/mi-cuenta" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Historial</Link>
                  <Link href="/favoritos" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Favoritos</Link>
                  <Link href="/mi-cuenta" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Mis Publicaciones</Link>
                  <Link href="/publicar" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Vender mi Vehículo</Link>
                  <Link href="/mi-cuenta" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Perfil</Link>
                  
                  <Link href="/mi-cuenta" className={`${styles.dropdownItem} ${styles.dropdownHighlight}`} onClick={() => setAccountDropdownOpen(false)}>
                    Destacar anuncios <Crown size={16} />
                  </Link>
                  
                  <Link href="/mi-cuenta" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Pagos</Link>
                  <Link href="/api/auth/signout" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Cerrar Sesión</Link>
                </div>
              )}
            </div>
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
