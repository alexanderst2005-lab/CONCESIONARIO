import { db } from "@/db";
import { vehicles, brands, models, categories } from "@/db/schema";
import { eq, desc, and, ilike, inArray } from "drizzle-orm";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";
import FilterPanel from "@/components/FilterPanel";
import { Car } from "lucide-react";

export default async function VehiculosPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { marca, categoria, modelo, ciudad } = await searchParams;

  let conditions: any[] = [inArray(vehicles.status, ["ACTIVO", "VENDIDO", "approved", "APPROVED"])];
  
  if (marca) {
    const matchingBrands = await db.select({ id: brands.id }).from(brands).where(ilike(brands.name, `%${marca}%`));
    if (matchingBrands.length > 0) conditions.push(inArray(vehicles.brandId, matchingBrands.map(b => b.id)));
    else conditions.push(eq(vehicles.brandId, -1));
  }
  
  if (modelo) {
    const matchingModels = await db.select({ id: models.id }).from(models).where(ilike(models.name, `%${modelo}%`));
    if (matchingModels.length > 0) conditions.push(inArray(vehicles.modelId, matchingModels.map(m => m.id)));
    else conditions.push(eq(vehicles.modelId, -1));
  }
  
  if (categoria) {
    const matchingCats = await db.select({ id: categories.id }).from(categories).where(ilike(categories.name, `%${categoria}%`));
    if (matchingCats.length > 0) conditions.push(inArray(vehicles.categoryId, matchingCats.map(c => c.id)));
    else conditions.push(eq(vehicles.categoryId, -1));
  }

  if (ciudad) conditions.push(ilike(vehicles.city, `%${ciudad}%`));

  const limit = 10;
  const page = parseInt(await searchParams.then(p => p.page as string) || "1", 10);
  const offset = (page - 1) * limit;

  const vehiclesRaw = await db.query.vehicles.findMany({
    where: and(...conditions),
    orderBy: [desc(vehicles.isFeatured), desc(vehicles.createdAt)],
    with: { brand: true, model: true, category: true, images: true },
    limit: limit + 1,
    offset: offset,
  });

  const hasMore = vehiclesRaw.length > limit;
  const vehiclesToDisplay = hasMore ? vehiclesRaw.slice(0, limit) : vehiclesRaw;

  const vehiclesData = vehiclesToDisplay.map(v => ({
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
    status: v.status,
    isFeatured: v.isFeatured,
    isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
  }));

  const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.isActive, true));
  const allCats = await db.select({ id: categories.id, name: categories.name, brandsList: categories.brandsList }).from(categories).where(eq(categories.isActive, true));

  return (
    <div className={`container ${styles.catalogContainer}`}>

      {/* ─── Collapsible Filter Panel ─── */}
      <FilterPanel
        allBrands={allBrands}
        allCats={allCats}
        currentMarca={marca}
        currentCategoria={categoria}
        currentModelo={modelo}
        currentCiudad={ciudad}
      />

      {/* ─── Results ─── */}
      <main className={styles.gridArea}>
        <div className={styles.catalogHeader}>
          <div>
            <h1 className={`${styles.catalogTitle} serif-title`}>
              {marca ? `Vehículos ${marca}` : categoria ? `Tipo ${categoria}` : "Catálogo"}
            </h1>
            <div style={{ display: 'none' }} id="debug-info">
              {JSON.stringify({ marca, categoria, modelo, ciudad })}
            </div>
            <p className={styles.resultsCount}>
              <span className={styles.resultsNumber}>{vehiclesData.length}</span>
              {" "}vehículo{vehiclesData.length !== 1 ? "s" : ""} encontrado{vehiclesData.length !== 1 ? "s" : ""}
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
          <>
            <div className={styles.grid}>
              {vehiclesData.map(v => (
                <VehicleCard key={v.id} vehicle={v as any} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {(page > 1 || hasMore) && (
              <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                {page > 1 && (
                  <a href={`?${new URLSearchParams({...Object.fromEntries(Object.entries(await searchParams).filter(([k,v]) => v !== undefined) as [string, string][]), page: (page - 1).toString()}).toString()}`} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', display: 'inline-block', textAlign: 'center', marginRight: '1rem', background: '#222', color: '#fff', textDecoration: 'none', borderRadius: '4px', border: '1px solid #333' }}>
                    &larr; Anterior
                  </a>
                )}
                {hasMore && (
                  <a href={`?${new URLSearchParams({...Object.fromEntries(Object.entries(await searchParams).filter(([k,v]) => v !== undefined) as [string, string][]), page: (page + 1).toString()}).toString()}`} className="btn-primary" style={{ padding: '0.75rem 2rem', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                    Ver más resultados &rarr;
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
