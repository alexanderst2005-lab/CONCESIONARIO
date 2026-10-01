import { db } from "@/db";
import { vehicles, brands, models, categories } from "@/db/schema";
import { eq, desc, and, like, ilike } from "drizzle-orm";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";

export default async function VehiculosPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const { marca, categoria, modelo, ciudad } = searchParams;

  let conditions: any[] = [eq(vehicles.status, "ACTIVO")]; // O approved si se maneja así

  // Si envían marca, filtramos (usando ilike para ignorar mayúsculas/minúsculas)
  if (marca) {
    conditions.push(ilike(brands.name, `%${marca}%`));
  }
  
  if (modelo) {
    conditions.push(ilike(models.name, `%${modelo}%`));
  }
  
  if (ciudad) {
    conditions.push(ilike(vehicles.city, `%${ciudad}%`));
  }

  if (categoria) {
    conditions.push(ilike(categories.name, `%${categoria}%`));
  }

  const vehiclesData = await db
    .select({
      id: vehicles.id,
      slug: vehicles.slug,
      version: vehicles.version,
      year: vehicles.year,
      mileage: vehicles.mileage,
      price: vehicles.price,
      city: vehicles.city,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      brandName: brands.name,
      modelName: models.name,
      categoryName: categories.name,
      isFeatured: vehicles.isFeatured,
      isDealerVehicle: vehicles.isDealerVehicle,
    })
    .from(vehicles)
    .leftJoin(brands, eq(vehicles.brandId, brands.id))
    .leftJoin(models, eq(vehicles.modelId, models.id))
    .leftJoin(categories, eq(vehicles.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(vehicles.createdAt));

  // Obtener filtros dinámicos (opcional para popular los selects)
  const allBrands = await db.select().from(brands).where(eq(brands.isActive, true));
  const allCats = await db.select().from(categories).where(eq(categories.isActive, true));

  return (
    <div className={`container ${styles.catalogContainer}`}>
      {/* Sidebar de Filtros */}
      <aside className={styles.sidebar}>
        <form className={styles.filterBox} method="GET" action="/vehiculos">
          <h2 className={styles.filterTitle}>Filtros</h2>
          
          <div className={styles.filterGroup}>
            <label>Ubicación</label>
            <input type="text" name="ciudad" defaultValue={ciudad || ""} placeholder="Ej: Bogotá" style={{ width: '100%', padding: '0.75rem', background: '#050505', border: '1px solid #222', borderRadius: '4px', color: '#fff' }} />
          </div>

          <div className={styles.filterGroup}>
            <label>Categoría</label>
            <select name="categoria" defaultValue={categoria || ""}>
              <option value="">Todas</option>
              {allCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Marca</label>
            <select name="marca" defaultValue={marca || ""}>
              <option value="">Todas</option>
              {allBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Modelo</label>
            <input type="text" name="modelo" defaultValue={modelo || ""} placeholder="Ej: CX-5" style={{ width: '100%', padding: '0.75rem', background: '#050505', border: '1px solid #222', borderRadius: '4px', color: '#fff' }} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Aplicar Filtros
          </button>
          
          {(marca || categoria || modelo || ciudad) && (
            <a href="/vehiculos" className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem', textAlign: 'center', display: 'block' }}>
              Limpiar Filtros
            </a>
          )}
        </form>
      </aside>

      {/* Grid de Vehículos */}
      <main className={styles.gridArea}>
        <div className={styles.catalogHeader}>
          <h1 className="serif-title">
            {marca ? `Vehículos ${marca}` : categoria ? `Vehículos tipo ${categoria}` : "Catálogo de Vehículos"}
          </h1>
          <p className={styles.resultsCount}>{vehiclesData.length} resultados</p>
        </div>

        {vehiclesData.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#080808', borderRadius: '8px', border: '1px solid #111' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>No encontramos vehículos</h3>
            <p style={{ color: '#888' }}>Intenta ajustar los filtros de búsqueda.</p>
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
