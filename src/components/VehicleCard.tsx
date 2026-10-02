"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VehicleCard.module.css";
import { Heart, Gauge, Calendar, Settings2, MapPin } from "lucide-react";

export default function VehicleCard({ vehicle }: { vehicle: any }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("vehicleFavorites");
      if (stored) {
        const favorites = JSON.parse(stored);
        if (favorites.some((v: any) => v.slug === vehicle.slug)) {
          setIsFavorite(true);
        }
      }
    } catch (e) {}
  }, [vehicle.slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const stored = localStorage.getItem("vehicleFavorites");
      let favorites = stored ? JSON.parse(stored) : [];
      
      if (isFavorite) {
        favorites = favorites.filter((v: any) => v.slug !== vehicle.slug);
      } else {
        favorites.push({
          slug: vehicle.slug,
          brandName: vehicle.brandName,
          modelName: vehicle.modelName,
          year: vehicle.year,
          city: vehicle.city,
          price: vehicle.price,
          image: vehicle.image || vehicle.imageUrl || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop"
        });
      }
      
      localStorage.setItem("vehicleFavorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error(e);
    }
  };

  // Manejar el precio de forma segura
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price || 0);

  // Usar imagen real si existe, o un placeholder premium
  const displayImage = vehicle.image || vehicle.imageUrl || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop";

  return (
    <div className={styles.card}>
      <button 
        className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`} 
        onClick={toggleFavorite}
        style={{ zIndex: 10 }}
      >
        <Heart 
          size={20} 
          strokeWidth={isFavorite ? 0 : 1.5} 
          fill={isFavorite ? "var(--gold-accent)" : "none"} 
          color={isFavorite ? "var(--gold-accent)" : "currentColor"}
          className={isFavorite ? styles.heartBeat : ""}
        />
      </button>

      <Link href={`/vehiculo/${vehicle.slug}`} className={styles.cardLink}>
        
        <div className={styles.imageContainer}>
          {vehicle.status === "VENDIDO" && (
            <div className={styles.badge} style={{ backgroundColor: "#ef4444", color: "#fff" }}>VENDIDO</div>
          )}
          {vehicle.isFeatured && vehicle.status !== "VENDIDO" && (
            <div className={styles.badge}>Destacado</div>
          )}
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
