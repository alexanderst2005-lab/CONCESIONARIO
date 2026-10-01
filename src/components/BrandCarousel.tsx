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

  // NO DUPLICATES - Just use the actual active brands
  const displayBrands = brands;

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (trackRef.current && !isPaused && !isDragging) {
        // Move slightly faster
        trackRef.current.scrollLeft += (delta * 0.05);

        // If we reached the end, snap back to the beginning fluidly
        if (
          trackRef.current.scrollLeft + trackRef.current.clientWidth >= 
          trackRef.current.scrollWidth - 1 // -1 for subpixel rounding
        ) {
          trackRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isDragging]);

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
        <div className={styles.track}>
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
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
                  <span className={styles.brandNameFallback}>{brand.name}</span>
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
