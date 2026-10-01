"use client";

import React, { useRef } from "react";
import styles from "./VehicleCarousel.module.css";
import CompactVehicleCard from "./CompactVehicleCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VehicleCarousel({ vehicles }: { vehicles: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!vehicles || vehicles.length === 0) {
    return <p style={{ color: '#888' }}>No hay vehículos disponibles por el momento.</p>;
  }

  return (
    <div className={styles.carouselWrapper}>
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scroll('left')}>
        <ChevronLeft size={24} strokeWidth={1.5} />
      </button>
      
      <div className={styles.carouselContainer} ref={scrollRef}>
        {vehicles.map((v) => (
          <div key={v.id} className={styles.cardWrapper}>
            <CompactVehicleCard vehicle={v} />
          </div>
        ))}
      </div>

      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scroll('right')}>
        <ChevronRight size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}
