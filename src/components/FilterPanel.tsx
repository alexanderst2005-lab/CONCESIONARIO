"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, MapPin, Tag, Car, Search, X } from "lucide-react";
import styles from "./FilterPanel.module.css";
import { useRouter } from "next/navigation";

interface FilterPanelProps {
  allBrands: { id: number; name: string }[];
  allCats: { id: number; name: string; brandsList?: string }[];
  currentMarca?: string;
  currentCategoria?: string;
  currentModelo?: string;
  currentCiudad?: string;
}

export default function FilterPanel({
  allBrands,
  allCats,
  currentMarca,
  currentCategoria,
  currentModelo,
  currentCiudad,
}: FilterPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedCat, setSelectedCat] = useState(currentCategoria || "");
  const [selectedBrand, setSelectedBrand] = useState(currentMarca || "");
  const [selectedModel, setSelectedModel] = useState(currentModelo || "");
  const [selectedCity, setSelectedCity] = useState(currentCiudad || "");

  const [filteredBrands, setFilteredBrands] = useState(allBrands);

  useEffect(() => {
    if (selectedCat) {
      const catObj = allCats.find((c) => c.name === selectedCat);
      let newFiltered = allBrands;
      if (catObj && catObj.brandsList) {
        try {
          const allowedBrands: string[] = JSON.parse(catObj.brandsList);
          if (allowedBrands.length > 0) {
            newFiltered = allBrands.filter((b) => allowedBrands.includes(b.name));
          } else {
            newFiltered = [];
          }
        } catch (e) {
          newFiltered = [];
        }
      } else {
        newFiltered = [];
      }
      setFilteredBrands(newFiltered);
      if (selectedBrand && !newFiltered.some(b => b.name === selectedBrand)) {
        setSelectedBrand("");
      }
    } else {
      setFilteredBrands(allBrands);
    }
  }, [selectedCat, allBrands, allCats, selectedBrand]);

  const hasActiveFilters = !!(currentMarca || currentCategoria || currentModelo || currentCiudad);
  const activeCount = [currentMarca, currentCategoria, currentModelo, currentCiudad].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("ciudad", selectedCity);
    if (selectedBrand) params.set("marca", selectedBrand);
    if (selectedCat) params.set("categoria", selectedCat);
    if (selectedModel) params.set("modelo", selectedModel);
    
    router.push(`/vehiculos?${params.toString()}`);
  };

  return (
    <aside className={styles.sidebar}>
      {/* ─── Collapsible trigger ─── */}
      <div className={styles.filterBox}>
        <button
          type="button"
          className={styles.filterToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.filterToggleLeft}>
            <SlidersHorizontal size={16} strokeWidth={1.5} />
            <span className={styles.filterTitle}>Filtros</span>
            {hasActiveFilters && (
              <span className={styles.activeCount}>{activeCount}</span>
            )}
          </div>
          <div className={styles.filterToggleRight}>
            {hasActiveFilters && (
              <a
                href="/vehiculos"
                className={styles.clearBtn}
                onClick={e => e.stopPropagation()}
              >
                <X size={12} /> Limpiar
              </a>
            )}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* ─── Active pills (always visible) ─── */}
        {hasActiveFilters && (
          <div className={styles.activePills}>
            {currentMarca && <span className={styles.pill}><Car size={11} /> {currentMarca}</span>}
            {currentCategoria && <span className={styles.pill}><Tag size={11} /> {currentCategoria}</span>}
            {currentModelo && <span className={styles.pill}><Search size={11} /> {currentModelo}</span>}
            {currentCiudad && <span className={styles.pill}><MapPin size={11} /> {currentCiudad}</span>}
          </div>
        )}

        {/* ─── Collapsible body ─── */}
        <div className={`${styles.filterBody} ${isOpen ? styles.filterBodyOpen : ""}`}>
          <form onSubmit={handleSubmit}>
            <div className={styles.filterGrid}>
              
              {/* Categoría */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Tag size={12} strokeWidth={2} /> Categoría
                </label>
                <select 
                  value={selectedCat} 
                  onChange={(e) => setSelectedCat(e.target.value)} 
                  className={styles.filterSelect}
                >
                  <option value="">Todas</option>
                  {allCats.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              {(!selectedCat || filteredBrands.length > 0) && (
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>
                    <Car size={12} strokeWidth={2} /> Marca
                  </label>
                  <select 
                    value={selectedBrand} 
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                    className={styles.filterSelect}
                  >
                    <option value="">Todas</option>
                    {filteredBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modelo */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Search size={12} strokeWidth={2} /> Modelo
                </label>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="Ej: CX-5"
                  className={styles.filterInput}
                />
              </div>

              {/* Ciudad */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <MapPin size={12} strokeWidth={2} /> Ubicación
                </label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Ej: Bogotá"
                  className={styles.filterInput}
                />
              </div>

            </div>

            <button type="submit" className={styles.applyBtn}>
              Aplicar Filtros
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
