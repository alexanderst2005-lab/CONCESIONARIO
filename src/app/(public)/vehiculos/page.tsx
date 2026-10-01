import { db } from "@/db";
import { vehicles, brands, models, categories } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";
import { SlidersHorizontal, MapPin, Tag, Car, Search, X } from "lucide-react";

export default async function VehiculosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { marca, categoria, modelo, ciudad } = await searchParams;

  let conditions: any[] = [eq(vehicles.status, "ACTIVO")];

  if (marca) conditions.push(ilike(brands.name, `%${marca}%`));
  if (modelo) conditions.push(ilike(models.name, `%${modelo}%`));
  if (ciudad) conditions.push(ilike(vehicles.city, `%${ciudad}%`));
  if (categoria) conditions.push(ilike(categories.name, `%${categoria}%`));

  const vehiclesRaw = await db.query.vehicles.findMany({
    where: and(...conditions),
    orderBy: [desc(vehicles.createdAt)],
    with: { brand: true, model: true, category: true, images: true }
  });

  const vehiclesData = vehiclesRaw.map(v => ({
    id: v.id,
    slug: v.slug,
    version: v.version,
    year: v.year,
    mileage: v.mileage,
    price: v.price,
    city: v.city,
    fuelType: v.fuelType,
    transmission: v.transmission,
    brandName: v.brand?.name || "Desconocido",
    modelName: v.model?.name || "Desconocido",
    categoryName: v.category?.name || "Categoría",
    isFeatured: v.isFeatured,
    isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
  }));

  const allBrands = await db.select().from(brands).where(eq(brands.isActive, true));
  const allCats = await db.select().from(categories).where(eq(categories.isActive, true));

  const hasActiveFilters = !!(marca || categoria || modelo || ciudad);

  return (
    <div className={`container ${styles.catalogContainer}`}>

      {/* ────────────────── SIDEBAR FILTERS ────────────────── */}
      <aside className={styles.sidebar}>
        <form className={styles.filterBox} method="GET" action="/vehiculos">
          
          <div className={styles.filterHeader}>
            <div className={styles.filterHeaderLeft}>
              <SlidersHorizontal size={18} strokeWidth={1.5} />
              <h2 className={styles.filterTitle}>Filtros</h2>
            </div>
            {hasActiveFilters && (
              <a href="/vehiculos" className={styles.clearFiltersLink}>
                <X size={14} /> Limpiar
              </a>
            )}
          </div>

          <div className={styles.filterDivider} />

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className={styles.activePills}>
              {marca && <span className={styles.pill}>{marca}</span>}
              {categoria && <span className={styles.pill}>{categoria}</span>}
              {modelo && <span className={styles.pill}>{modelo}</span>}
              {ciudad && <span className={styles.pill}><MapPin size={11} /> {ciudad}</span>}
            </div>
          )}

          <div className={styles.filterGrid}>
            {/* Ciudad */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <MapPin size={13} strokeWidth={2} /> Ubicación
              </label>
              <input
                type="text"
                name="ciudad"
                defaultValue={ciudad || ""}
                placeholder="Ej: Bogotá"
                className={styles.filterInput}
              />
            </div>

            {/* Marca */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Car size={13} strokeWidth={2} /> Marca
              </label>
              <select name="marca" defaultValue={marca || ""} className={styles.filterSelect}>
                <option value="">Todas</option>
                {allBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>

            {/* Categoría */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Tag size={13} strokeWidth={2} /> Categoría
              </label>
              <select name="categoria" defaultValue={categoria || ""} className={styles.filterSelect}>
                <option value="">Todas</option>
                {allCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Modelo */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Search size={13} strokeWidth={2} /> Modelo
              </label>
              <input
                type="text"
                name="modelo"
                defaultValue={modelo || ""}
                placeholder="Ej: CX-5"
                className={styles.filterInput}
              />
            </div>
          </div>

          <button type="submit" className={styles.applyBtn}>
            Aplicar Filtros
          </button>
        </form>
      </aside>

      {/* ────────────────── RESULTS ────────────────── */}
      <main className={styles.gridArea}>
        <div className={styles.catalogHeader}>
          <div>
            <h1 className={`${styles.catalogTitle} serif-title`}>
              {marca ? `Vehículos ${marca}` : categoria ? `Tipo ${categoria}` : "Catálogo"}
            </h1>
            <p className={styles.resultsCount}>
              <span className={styles.resultsNumber}>{vehiclesData.length}</span> vehículo{vehiclesData.length !== 1 ? "s" : ""} encontrado{vehiclesData.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {vehiclesData.length === 0 ? (
          <div className={styles.emptyState}>
            <Car size={48} strokeWidth={1} style={{ color: "#333", marginBottom: "1rem" }} />
            <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Sin resultados</h3>
            <p style={{ color: "#666" }}>Intenta ajustar los filtros de búsqueda.</p>
            <a href="/vehiculos" style={{ color: "#B19B4C", textDecoration: "none", fontSize: "0.9rem", marginTop: "1rem", display: "inline-block" }}>
              Ver todos los vehículos →
            </a>
          </div>
        ) : (
          <div className={styles.grid}>
            {vehiclesData.map(v => (
              <VehicleCard key={v.id} vehicle={v as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
