"use client";

import React, { useState } from "react";
import styles from "./ImageGallery.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGallery({ images }: { images: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Extraemos URL (por si vienen del objeto DB o como string fallback)
  const getUrl = (img: any) => (typeof img === 'string' ? img : img.url);

  if (!images || images.length === 0) return null;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Distancia mínima para considerar swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <div 
        className={styles.mainImageWrapper}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img 
          src={getUrl(images[currentIndex])} 
          alt="Vista del vehículo" 
          className={styles.mainImage} 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLightboxOpen(true); }}
        />
        
        {images.length > 1 && (
          <>
            <button className={`${styles.navButton} ${styles.navPrev}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}>
              <ChevronLeft size={48} strokeWidth={1} />
            </button>
            <button className={`${styles.navButton} ${styles.navNext}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}>
              <ChevronRight size={48} strokeWidth={1} />
            </button>

            <div className={styles.dotsContainer}>
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {isLightboxOpen && (
        <div className={styles.lightbox} onClick={() => setIsLightboxOpen(false)}>
          <button className={styles.closeBtn} onClick={() => setIsLightboxOpen(false)}>✕</button>
          <img src={getUrl(images[currentIndex])} alt="Vista completa" className={styles.lightboxImage} onClick={(e) => e.stopPropagation()} />
          
          {images.length > 1 && (
            <>
              <button className={`${styles.navButton} ${styles.navPrev}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(); }}>
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              <button className={`${styles.navButton} ${styles.navNext}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(); }}>
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
