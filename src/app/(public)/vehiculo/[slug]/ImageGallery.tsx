"use client";

import React, { useState } from "react";
import styles from "./ImageGallery.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGallery({ images }: { images: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Extraemos URL (por si vienen del objeto DB o como string fallback)
  const getUrl = (img: any) => (typeof img === 'string' ? img : img.url);

  if (!images || images.length === 0) return null;

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <img 
          src={getUrl(images[currentIndex])} 
          alt="Vista del vehículo" 
          className={styles.mainImage} 
        />
        
        {images.length > 1 && (
          <>
            <button className={`${styles.navButton} ${styles.navPrev}`} onClick={prevImage}>
              <ChevronLeft size={48} strokeWidth={1} />
            </button>
            <button className={`${styles.navButton} ${styles.navNext}`} onClick={nextImage}>
              <ChevronRight size={48} strokeWidth={1} />
            </button>

            <div className={styles.dotsContainer}>
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
