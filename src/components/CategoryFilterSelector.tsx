"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Bike, CarFront, Truck } from "lucide-react";
import styles from "./CategoryFilterSelector.module.css";

export default function CategoryFilterSelector({
  categories,
  brands
}: {
  categories: any[];
  brands: any[];
}) {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<any | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const handleSelectCategory = (cat: any) => {
    if (selectedCat?.id === cat.id) {
      setSelectedCat(null);
      setSelectedSubtype("");
      setSelectedBrand("");
    } else {
      setSelectedCat(cat);
      setSelectedSubtype("");
      setSelectedBrand("");
    }
  };

  const handleSearch = () => {
    if (!selectedCat) return;
    
    let url = `/vehiculos?categoria=${encodeURIComponent(selectedCat.name)}`;
    if (selectedSubtype) url += `&modelo=${encodeURIComponent(selectedSubtype)}`; // Map subtypes to "modelo" search just to filter
    if (selectedBrand) url += `&marca=${encodeURIComponent(selectedBrand)}`;
    
    router.push(url);
  };

  return (
    <div className={styles.container}>
      {/* Scrollable Categories Row */}
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
              onClick={() => handleSelectCategory(cat)}
              className={styles.categoryButton}
              style={{
                background: isSelected ? "var(--gold-accent)" : "#111",
                color: isSelected ? "#000" : "#fff",
                border: isSelected ? "1px solid var(--gold-accent)" : "1px solid rgba(255,255,255,0.05)"
              }}
            >
              {cat.imageUrl ? (
                <div className={styles.categoryImage} style={{ border: isSelected ? "1px solid rgba(0,0,0,0.1)" : "none" }}>
                  <img src={cat.imageUrl} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <Icon className={styles.categoryIcon} strokeWidth={1.5} style={{ color: isSelected ? "#000" : "var(--gold-accent)" }} />
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
          <h3 className={styles.filterPanelTitle}>Filtrar {selectedCat.name}</h3>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
            
            {/* Si tiene subtipos, mostrar selector */}
            {(() => {
              let subtypesArr: string[] = [];
              try {
                if (selectedCat.subtypes) {
                  const parsed = JSON.parse(selectedCat.subtypes);
                  if (Array.isArray(parsed) && parsed.length > 0) subtypesArr = parsed;
                }
              } catch (e) {
                if (selectedCat.subtypes && typeof selectedCat.subtypes === "string") {
                  subtypesArr = [selectedCat.subtypes];
                }
              }

              if (subtypesArr.length > 0) {
                return (
                  <div style={{ flex: "1 1 100%" }}>
                    <label style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Subtipo</label>
                    <select
                      value={selectedSubtype}
                      onChange={e => setSelectedSubtype(e.target.value)}
                      style={{ width: "100%", boxSizing: "border-box", padding: "0.8rem", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", outline: "none" }}
                    >
                      <option value="">Cualquiera</option>
                      {subtypesArr.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            {/* Selector de marca general */}
            {(() => {
              let allowedBrands = brands;
              
              // Filter brands based on category's brandsList if available
              if (selectedCat.brandsList) {
                let parsedBrands: string[] = [];
                try {
                  const parsed = JSON.parse(selectedCat.brandsList);
                  if (Array.isArray(parsed)) {
                    parsedBrands = parsed;
                  }
                } catch(e) {
                  // Fallback for old comma-separated strings
                  if (typeof selectedCat.brandsList === 'string' && selectedCat.brandsList.trim() !== '') {
                    parsedBrands = selectedCat.brandsList.split(',').map((s: string) => s.trim());
                  }
                }
                
                // Si la categoría tiene la propiedad brandsList definida (incluso si está vacía []),
                // strictly filter the brands. If the admin intentionally selected 0 brands, it shows 0 brands.
                const lowercaseParsed = parsedBrands.map(b => b.toLowerCase().trim());
                allowedBrands = brands.filter(b => lowercaseParsed.includes(b.name.toLowerCase().trim()));
              }

              return (
                <div style={{ flex: "1 1 100%" }}>
                  <label style={{ display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Marca</label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "0.8rem", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", outline: "none" }}
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              onClick={handleSearch}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.8rem 2.5rem", background: "var(--gold-accent)", color: "#000", fontWeight: "bold", border: "none", borderRadius: "30px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}
            >
              Buscar Vehículos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
