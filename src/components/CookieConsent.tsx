"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X, Check, Settings, SlidersHorizontal } from "lucide-react";
import styles from "./CookieConsent.module.css";

export interface CookiePreferences {
  necessary: boolean; // Siempre true
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
  timestamp?: string;
}

const STORAGE_KEY = "cookie_preferences_autos_patron";

export function getCookieConsent(): CookiePreferences {
  if (typeof window === "undefined") {
    return { necessary: true, analytics: false, preferences: false, marketing: false };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error al leer preferencias de cookies", e);
  }
  return { necessary: true, analytics: false, preferences: false, marketing: false };
}

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-cookie-settings"));
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar si ya existen preferencias guardadas
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
        setShowBanner(false);
      } else {
        // Primera visita: mostrar aviso
        setShowBanner(true);
      }
    } catch (e) {
      setShowBanner(true);
    }

    // Escuchar evento personalizado para reabrir modal desde cualquier parte (ej: Footer)
    const handleOpenSettings = () => {
      setShowModal(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const savePreferences = (newPrefs: CookiePreferences) => {
    const updated: CookiePreferences = {
      ...newPrefs,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event to inform other scripts if needed
      window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: updated }));
    } catch (e) {
      console.error("Error al guardar preferencias de cookies", e);
    }
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      preferences: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      preferences: false,
      marketing: false,
    });
  };

  const handleToggleCategory = (key: keyof Omit<CookiePreferences, "necessary" | "timestamp">) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveModal = () => {
    savePreferences(preferences);
  };

  return (
    <>
      {/* Banner Principal de Cookies */}
      {showBanner && !showModal && (
        <div className={styles.bannerContainer} role="dialog" aria-label="Aviso de privacidad y cookies">
          <div className={styles.bannerContent}>
            <div className={styles.bannerHeader}>
              <Cookie size={28} className={styles.cookieIcon} />
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>
                  Experiencia <span className={styles.bannerTitleSpan}>Autos del Patrón</span>
                </h3>
                <p className={styles.bannerDescription}>
                  Utilizamos cookies propias y de terceros para optimizar tu navegación, recordar tus preferencias de búsqueda y analizar el rendimiento del sitio.
                </p>
              </div>
            </div>

            <div className={styles.bannerActions}>
              <button 
                type="button" 
                className={styles.btnAcceptAll} 
                onClick={handleAcceptAll}
              >
                Aceptar todas
              </button>
              
              <button 
                type="button" 
                className={styles.btnReject} 
                onClick={handleRejectAll}
              >
                Rechazar
              </button>
              
              <button 
                type="button" 
                className={styles.btnConfigure} 
                onClick={() => setShowModal(true)}
              >
                Configurar cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración Detallada */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <SlidersHorizontal size={20} style={{ color: "#d4af37" }} />
                Configuración de Cookies
              </h3>
              <button 
                type="button" 
                className={styles.btnClose} 
                onClick={() => setShowModal(false)}
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              <p className={styles.modalIntro}>
                Personaliza tus preferencias sobre el uso de cookies. Las cookies estrictamente necesarias permanecen siempre activas para garantizar la seguridad y funcionamiento básico de la plataforma.
              </p>

              {/* Categoría 1: Necesarias */}
              <div className={styles.categoryCard}>
                <div className={styles.categoryTop}>
                  <div className={styles.categoryTitle}>
                    <ShieldCheck size={18} style={{ color: "#d4af37" }} />
                    Estrictamente Necesarias
                  </div>
                  <span className={styles.categoryBadge}>Siempre Activas</span>
                </div>
                <p className={styles.categoryDesc}>
                  Indispensables para el funcionamiento técnico de la página (autenticación de usuarios, seguridad en el inicio de sesión y gestión de solicitudes).
                </p>
              </div>

              {/* Categoría 2: Analíticas */}
              <div className={styles.categoryCard}>
                <div className={styles.categoryTop}>
                  <span className={styles.categoryTitle}>Analíticas y Rendimiento</span>
                  <label className={styles.switchLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.switchInput}
                      checked={preferences.analytics}
                      onChange={() => handleToggleCategory("analytics")}
                    />
                    <span className={styles.switchSlider} />
                  </label>
                </div>
                <p className={styles.categoryDesc}>
                  Nos permiten evaluar de forma anónima el uso del catálogo y rendimiento del sitio para mejorar continuamente la experiencia de compra e interacción.
                </p>
              </div>

              {/* Categoría 3: Preferencias */}
              <div className={styles.categoryCard}>
                <div className={styles.categoryTop}>
                  <span className={styles.categoryTitle}>Preferencias de Navegación</span>
                  <label className={styles.switchLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.switchInput}
                      checked={preferences.preferences}
                      onChange={() => handleToggleCategory("preferences")}
                    />
                    <span className={styles.switchSlider} />
                  </label>
                </div>
                <p className={styles.categoryDesc}>
                  Permiten recordar tus filtros habituales de vehículos (marcas preferidas, rango de precios y ciudades) durante tus sesiones.
                </p>
              </div>

              {/* Categoría 4: Marketing */}
              <div className={styles.categoryCard}>
                <div className={styles.categoryTop}>
                  <span className={styles.categoryTitle}>Publicidad y Ofertas</span>
                  <label className={styles.switchLabel}>
                    <input 
                      type="checkbox" 
                      className={styles.switchInput}
                      checked={preferences.marketing}
                      onChange={() => handleToggleCategory("marketing")}
                    />
                    <span className={styles.switchSlider} />
                  </label>
                </div>
                <p className={styles.categoryDesc}>
                  Nos ayudan a mostrarte información relevante de autos y promociones especiales acordes con tus intereses de compra-venta.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnSave} 
                onClick={handleSaveModal}
              >
                Guardar selección
              </button>
              <button 
                type="button" 
                className={styles.btnAcceptAll} 
                onClick={handleAcceptAll}
              >
                Aceptar todas
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
