"use client";

import React, { useState } from "react";
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
  const [isPaused, setIsPaused] = useState(false);

  if (brands.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Próximamente encontrarás nuestras marcas disponibles.</p>
      </div>
    );
  }

  // Duplicate items to ensure seamless infinite loop
  // We duplicate enough times so the scroll never reaches the real end
  const items = [...brands, ...brands, ...brands, ...brands];

  return (
    <div
      className={styles.carouselWrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade masks */}
      <div className={styles.fadeLeft} />
      <div className={styles.fadeRight} />

      <div className={styles.track} style={{ animationPlayState: isPaused ? "paused" : "running" }}>
        {items.map((brand, idx) => (
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
                  height={55}
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
  );
}
