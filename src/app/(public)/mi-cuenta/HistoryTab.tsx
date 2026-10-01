"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function HistoryTab() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Aquí podrías leer del localStorage si tienes implementado el guardado de historial
    const storedHistory = localStorage.getItem("vehicleHistory");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Error parsing history");
      }
    }
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitleWrapper}>
          <h1 className="serif-title">Historial de Visualizaciones</h1>
          <p>Vehículos que has visitado recientemente.</p>
        </div>
      </div>

      <div className={styles.vehicleList}>
        {history.length === 0 ? (
          <p style={{ padding: "3rem", textAlign: "center", color: "#666", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "4px" }}>
            No tienes historial de vehículos visitados aún.
          </p>
        ) : (
          history.map((v, i) => {
            const formattedPrice = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(v.price || 0);

            return (
              <div key={i} className={styles.vehicleListItem}>
                <div className={styles.listImageContainer} style={{ width: '120px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', backgroundColor: '#111' }}>
                  <img src={v.image || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop"} alt={v.modelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className={styles.listInfo}>
                  <h4>{v.brandName} {v.modelName}</h4>
                  <p>{v.year} • {v.city}</p>
                </div>
                <div className={styles.listPrice}>
                  <p>{formattedPrice}</p>
                </div>
                <div className={styles.listActions}>
                  <Link href={`/vehiculo/${v.slug}`} className={styles.actionBtn}>VER DE NUEVO</Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
