"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VehicleCard.module.css";
import { vehicles, brands, models } from "@/db/schema"; // Type reference only

// Ajustamos el tipo de acuerdo a lo que recibimos, pero lo dejamos genérico para la demo
export default function VehicleCard({ vehicle }: { vehicle: any }) {
  // Manejar el precio de forma segura
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price || 0);

  // Usar imagen real si existe, o un placeholder premium
  const displayImage = vehicle.imageUrl || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop";

  return (
    <div className={styles.card}>
      <Link href={`/vehiculo/${vehicle.slug}`} className={styles.cardLink}>
        
        <div className={styles.imageContainer}>
          {vehicle.isFeatured && (
            <div className={styles.badge}>Destacado</div>
          )}
          <button 
            className={styles.favoriteBtn} 
            onClick={(e) => {
              e.preventDefault();
              alert("Guardado en favoritos");
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
          <Image 
            src={displayImage} 
            alt={`${vehicle.brandName} ${vehicle.modelName}`} 
            fill 
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{vehicle.brandName} {vehicle.modelName}</h3>
            <span className={styles.year}>{vehicle.year}</span>
          </div>
          
          <p className={styles.version}>{vehicle.version}</p>

          <div className={styles.specsRow}>
            <span className={styles.spec}>{(vehicle.mileage || 0).toLocaleString()} km</span>
            <span className={styles.dot}>•</span>
            <span className={styles.spec}>{vehicle.transmission || 'Auto'}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.spec}>{vehicle.city}</span>
          </div>

          <div className={styles.footerRow}>
            <p className={styles.price}>{formattedPrice}</p>
            <span className={styles.viewBtn}>Ver →</span>
          </div>
        </div>

      </Link>
    </div>
  );
}
