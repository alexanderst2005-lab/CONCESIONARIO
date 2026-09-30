import React from "react";
import styles from "./VehicleCard.module.css";
import Link from "next/link";

interface Vehicle {
  id: number;
  slug: string;
  brandName: string | null;
  modelName: string | null;
  version: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  fuelType: string;
  transmission: string;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  // Format price
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {/* Placeholder para la imagen, más adelante conectaremos CDN */}
        <div className={styles.placeholderImg}>
          <span>{vehicle.brandName}</span>
        </div>
        <button className={styles.favoriteBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {vehicle.brandName} {vehicle.modelName}
          </h3>
          <p className={styles.version}>{vehicle.version}</p>
        </div>

        <div className={styles.specs}>
          <span>{vehicle.year}</span>
          <span className={styles.dot}>•</span>
          <span>{vehicle.mileage.toLocaleString()} km</span>
          <span className={styles.dot}>•</span>
          <span>{vehicle.city}</span>
        </div>
        
        <div className={styles.specs2}>
          <span>{vehicle.fuelType}</span>
          <span className={styles.dot}>•</span>
          <span>{vehicle.transmission}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>{formattedPrice}</div>
          <Link href={`/vehiculo/${vehicle.slug}`} className={styles.viewBtn}>
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
