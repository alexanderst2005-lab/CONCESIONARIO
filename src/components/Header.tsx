"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Crown } from "lucide-react";
import { signOut } from "next-auth/react";
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
          
          {session ? (() => {
            // Extract initials from session name
            const nameParts = (session.user?.name || "U").trim().split(" ");
            const initials = nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : nameParts[0].substring(0, 2).toUpperCase();

            return (
              <div className={styles.accountDropdownWrapper} ref={dropdownRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  aria-label="Mi cuenta"
                  title={session.user?.name || "Mi cuenta"}
                >
                  {initials}
                </button>

                {accountDropdownOpen && (
                  <div className={styles.accountDropdown}>
                    {/* User info header */}
                    <div className={styles.dropdownUserInfo}>
                      <div className={styles.dropdownAvatar}>{initials}</div>
                      <div>
                        <p className={styles.dropdownUserName}>{session.user?.name}</p>
                        <p className={styles.dropdownUserEmail}>{session.user?.email}</p>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/mi-cuenta?tab=historial" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Historial</Link>
                    <Link href="/favoritos" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Favoritos</Link>
                    <Link href="/mi-cuenta?tab=publicaciones" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Mis Publicaciones</Link>
                    <Link href="/publicar" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Vender mi Vehículo</Link>
                    <Link href="/mi-cuenta?tab=perfil" className={styles.dropdownItem} onClick={() => setAccountDropdownOpen(false)}>Perfil</Link>
                    <div className={styles.dropdownDivider} />
                    <button 
                      className={`${styles.dropdownItem} ${styles.dropdownSignout}`} 
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            );
          })() : (
            <Link href="/login" className={styles.loginLink} onClick={() => setMenuOpen(false)}>
              Iniciar sesión
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
