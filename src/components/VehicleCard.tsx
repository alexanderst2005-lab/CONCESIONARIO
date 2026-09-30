"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VehicleCard.module.css";
import { Heart, Gauge, Calendar, Settings2, MapPin } from "lucide-react";

export default function VehicleCard({ vehicle }: { vehicle: any }) {
  const [isFavorite, setIsFavorite] = useState(false);

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
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`} 
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart 
              size={20} 
              strokeWidth={isFavorite ? 0 : 1.5} 
              fill={isFavorite ? "var(--gold-accent)" : "none"} 
              color={isFavorite ? "var(--gold-accent)" : "currentColor"}
              className={isFavorite ? styles.heartBeat : ""}
            />
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
            <h3 className={`${styles.title} serif-title`}>{vehicle.brandName} {vehicle.modelName}</h3>
            <span className={styles.year}><Calendar size={14} strokeWidth={1.5} style={{marginRight: '4px'}}/> {vehicle.year}</span>
          </div>
          
          <p className={styles.version}>{vehicle.version}</p>

          <div className={styles.specsRow}>
            <span className={styles.spec}><Gauge size={14} strokeWidth={1.5} style={{marginRight: '4px'}}/> {(vehicle.mileage || 0).toLocaleString()} km</span>
            <span className={styles.dot}>•</span>
            <span className={styles.spec}><Settings2 size={14} strokeWidth={1.5} style={{marginRight: '4px'}}/> {vehicle.transmission || 'Auto'}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.spec}><MapPin size={14} strokeWidth={1.5} style={{marginRight: '4px'}}/> {vehicle.city}</span>
          </div>

          <div className={styles.footerRow}>
            <p className={styles.price}>{formattedPrice}</p>
            <span className={styles.viewBtn}>Ver detalles →</span>
          </div>
        </div>

      </Link>
    </div>
  );
}
