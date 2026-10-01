"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, MapPin, Tag, Car, Search, X } from "lucide-react";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  allBrands: { id: number; name: string }[];
  allCats: { id: number; name: string }[];
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
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = !!(currentMarca || currentCategoria || currentModelo || currentCiudad);
  const activeCount = [currentMarca, currentCategoria, currentModelo, currentCiudad].filter(Boolean).length;

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
          <form method="GET" action="/vehiculos">
            <div className={styles.filterGrid}>
              {/* Ciudad */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <MapPin size={12} strokeWidth={2} /> Ubicación
                </label>
                <input
                  type="text"
                  name="ciudad"
                  defaultValue={currentCiudad || ""}
                  placeholder="Ej: Bogotá"
                  className={styles.filterInput}
                />
              </div>

              {/* Marca */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Car size={12} strokeWidth={2} /> Marca
                </label>
                <select name="marca" defaultValue={currentMarca || ""} className={styles.filterSelect}>
                  <option value="">Todas</option>
                  {allBrands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Tag size={12} strokeWidth={2} /> Categoría
                </label>
                <select name="categoria" defaultValue={currentCategoria || ""} className={styles.filterSelect}>
                  <option value="">Todas</option>
                  {allCats.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Modelo */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Search size={12} strokeWidth={2} /> Modelo
                </label>
                <input
                  type="text"
                  name="modelo"
                  defaultValue={currentModelo || ""}
                  placeholder="Ej: CX-5"
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
