"use client";
import React, { useState } from 'react';
import styles from './ImageGallery.module.css';

export default function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <img src={images[currentIndex]} alt="Vehículo" className={styles.mainImage} />
        
        {images.length > 1 && (
          <div className={styles.navigationControls}>
            <button 
              className={styles.navButton} 
              onClick={() => setCurrentIndex(c => c === 0 ? images.length - 1 : c - 1)}
            >
              &#10094;
            </button>
            <button 
              className={styles.navButton} 
              onClick={() => setCurrentIndex(c => c === images.length - 1 ? 0 : c + 1)}
            >
              &#10095;
            </button>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnailsContainer}>
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`${styles.thumbnail} ${idx === currentIndex ? styles.activeThumbnail : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <img src={img} alt={`Miniatura ${idx}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
