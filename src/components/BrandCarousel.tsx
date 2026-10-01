"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./BrandCarousel.module.css";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface BrandCarouselProps {
  brands: Brand[];
}

export default function BrandCarousel({ brands }: BrandCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Duplicate brands for infinite loop effect
  const allBrands = [...brands, ...brands, ...brands];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    const x = e.touches[0].pageX - (trackRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  if (brands.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Próximamente encontrarás nuestras marcas disponibles.</p>
      </div>
    );
  }

  return (
    <div className={styles.carouselWrapper}>
      {/* Fade masks */}
      <div className={styles.fadeLeft} />
      <div className={styles.fadeRight} />

      <div
        className={`${styles.carouselTrack} ${isPaused ? styles.paused : ""}`}
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => { setIsPaused(false); setIsDragging(false); }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className={`${styles.track} ${isPaused ? styles.paused : ""}`}>
          {allBrands.map((brand, idx) => (
            <Link
              key={`${brand.id}-${idx}`}
              href={`/vehiculos?marca=${brand.name}`}
              className={styles.brandItem}
              draggable={false}
            >
              <div className={styles.logoWrapper}>
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    width={80}
                    height={60}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    draggable={false}
                  />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    <span>{brand.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className={styles.brandName}>{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
