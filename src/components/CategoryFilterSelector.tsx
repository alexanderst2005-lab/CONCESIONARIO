"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CategoryFilterSelector.module.css";
import { Car, Bike, CarFront, Truck } from "lucide-react";

interface CategoryFilterProps {
  categories: any[];
  brands: any[];
}

export default function CategoryFilterSelector({ categories, brands }: CategoryFilterProps) {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<any | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const handleSelectCategory = (cat: any) => {
    if (selectedCat?.id === cat.id) {
      setSelectedCat(null);
      setSelectedBrand("");
    } else {
      setSelectedCat(cat);
      setSelectedBrand("");
    }
  };

  const handleSearch = () => {
    if (!selectedCat) return;
    
    let url = `/vehiculos?categoria=${encodeURIComponent(selectedCat.name)}`;
    if (selectedBrand) url += `&marca=${encodeURIComponent(selectedBrand)}`;
    
    router.push(url);
  };

  return (
    <div className={styles.container}>
      {/* Scrollable / Centered Categories Row */}
      <div className={styles.scrollableRow}>
        {categories.map(cat => {
          const nameUpper = cat.name.toUpperCase();
          let Icon = Car;
          if (nameUpper.includes("MOTO")) Icon = Bike;
          else if (nameUpper.includes("CAMIONETA") || nameUpper.includes("SUV")) Icon = CarFront;
          else if (nameUpper.includes("CAMION") || nameUpper.includes("COMERCIAL")) Icon = Truck;

          const isSelected = selectedCat?.id === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={`${styles.categoryCard} ${isSelected ? styles.selectedCard : ""}`}
            >
              {cat.imageUrl ? (
                <div className={styles.imageWrapper}>
                  <img src={cat.imageUrl} alt={cat.name} className={styles.categoryImage} />
                </div>
              ) : (
                <div className={styles.iconWrapper}>
                  <Icon className={styles.categoryIcon} strokeWidth={1.8} />
                </div>
              )}
              <span className={styles.categoryName}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Panel below selected category */}
      {selectedCat && (
        <div className={styles.filterPanel}>
          <h3 className={styles.filterPanelTitle}>
            Filtrar {selectedCat.name}
          </h3>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
            {(() => {
              let allowedBrands = brands;
              
              if (selectedCat.brandsList) {
                let parsedBrands: string[] = [];
                try {
                  const parsed = JSON.parse(selectedCat.brandsList);
                  if (Array.isArray(parsed)) {
                    parsedBrands = parsed;
                  }
                } catch {
                  if (typeof selectedCat.brandsList === 'string' && selectedCat.brandsList.trim() !== '') {
                    parsedBrands = selectedCat.brandsList.split(',').map((s: string) => s.trim());
                  }
                }
                
                const lowercaseParsed = parsedBrands.map(b => b.toLowerCase().trim());
                if (lowercaseParsed.length > 0) {
                  allowedBrands = brands.filter(b => lowercaseParsed.includes(b.name.toLowerCase().trim()));
                }
              }

              return (
                <div style={{ flex: "1 1 100%" }}>
                  <label style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Marca
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="">Todas las marcas</option>
                    {allowedBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={handleSearch}
              className={styles.btnSearch}
            >
              Buscar Vehículos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
