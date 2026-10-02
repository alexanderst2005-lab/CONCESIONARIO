"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { Car } from "lucide-react";

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vehicleFavorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing favorites", e);
      }
    }
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.heroSection}>
        <div className="container">
          <h1 className={styles.heroTitle}>Mis Favoritos</h1>
          <p className={styles.heroSubtitle}>Vehículos que has guardado para revisar más tarde.</p>
        </div>
      </div>

      <div className={`container ${styles.contentContainer}`}>
        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <Car size={48} className={styles.emptyIcon} />
            <h2>No tienes vehículos favoritos</h2>
            <p>Explora nuestro inventario y guarda los vehículos que más te gusten.</p>
            <Link href="/vehiculos" className={styles.primaryBtn}>
              VER INVENTARIO
            </Link>
          </div>
        ) : (
          <div className={styles.vehicleList}>
            {favorites.map((v, i) => {
              const formattedPrice = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(v.price || 0);

              return (
                <div key={i} className={styles.vehicleListItem}>
                  <div className={styles.listImageContainer}>
                    <img src={v.image || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop"} alt={v.modelName} />
                  </div>
                  <div className={styles.listInfo}>
                    <h4>{v.brandName} {v.modelName}</h4>
                    <p>{v.year} • {v.city}</p>
                  </div>
                  <div className={styles.listPrice}>
                    <p>{formattedPrice}</p>
                  </div>
                  <div className={styles.listActions}>
                    <Link href={`/vehiculo/${v.slug}`} className={styles.actionBtn}>VER DETALLES</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
