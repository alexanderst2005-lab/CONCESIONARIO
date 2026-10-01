"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./CompactVehicleCard.module.css";
import { Heart, Gauge, MapPin, Settings2 } from "lucide-react";

export default function CompactVehicleCard({ vehicle }: { vehicle: any }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(vehicle.price || 0);

  const displayImage = vehicle.image || vehicle.imageUrl || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop";

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <button 
          className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart size={16} fill={isFavorite ? "#B19B4C" : "none"} color={isFavorite ? "#B19B4C" : "currentColor"} />
        </button>
        <Link href={`/vehiculo/${vehicle.slug}`}>
          <img src={displayImage} alt={`${vehicle.brandName} ${vehicle.modelName}`} className={styles.image} />
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.brand}>{vehicle.brandName}</div>
        <div className={styles.titleRow}>
          <Link href={`/vehiculo/${vehicle.slug}`} style={{textDecoration: 'none'}}>
            <h3 className={styles.title}>{vehicle.modelName}</h3>
          </Link>
          <span className={styles.yearBadge}>{vehicle.year}</span>
        </div>
        
        <div className={styles.specs}>
          <div className={styles.specItem}>
            <Gauge size={14} /> {vehicle.mileage?.toLocaleString('es-CO')} km
          </div>
          <div className={styles.specItem}>
            <Settings2 size={14} /> {vehicle.transmission || 'Mecánica'}
          </div>
          <div className={styles.specItem}>
            <MapPin size={14} /> {vehicle.city || 'Bogotá'}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            ${formattedPrice} <span className={styles.currency}>COP</span>
          </div>
          <Link href={`/vehiculo/${vehicle.slug}`} className={styles.detailsLink}>
            Ver detalles &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
