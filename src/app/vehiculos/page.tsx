import { db } from "@/db";
import { vehicles, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";

export default async function VehiculosPage() {
  // Simulación de búsqueda real en BD
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
    })
    .from(vehicles)
    .leftJoin(brands, eq(vehicles.brandId, brands.id))
    .leftJoin(models, eq(vehicles.modelId, models.id))
    .orderBy(desc(vehicles.createdAt));

  return (
    <div className={`container ${styles.catalogContainer}`}>
      {/* Sidebar de Filtros */}
      <aside className={styles.sidebar}>
        <div className={styles.filterBox}>
          <h2 className={styles.filterTitle}>Filtros</h2>
          
          <div className={styles.filterGroup}>
            <label>Ubicación</label>
            <select><option>Todas las ciudades</option><option>Bogotá</option><option>Medellín</option><option>Cali</option></select>
          </div>

          <div className={styles.filterGroup}>
            <label>Categoría</label>
            <select><option>Todas</option><option>Carros y camionetas</option><option>Motos</option></select>
          </div>

          <div className={styles.filterGroup}>
            <label>Marca</label>
            <select><option>Todas</option><option>Mazda</option><option>Toyota</option><option>Chevrolet</option></select>
          </div>

          <div className={styles.filterGroup}>
            <label>Precio</label>
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Mínimo" />
              <span>-</span>
              <input type="number" placeholder="Máximo" />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Año</label>
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Desde" />
              <span>-</span>
              <input type="number" placeholder="Hasta" />
            </div>
          </div>

          <button className={`btn-primary ${styles.applyBtn}`}>Aplicar Filtros</button>
        </div>
      </aside>

      {/* Resultados */}
      <main className={styles.results}>
        <div className={styles.resultsHeader}>
          <h1>Vehículos Disponibles</h1>
          <div className={styles.sorter}>
            <label>Ordenar por:</label>
            <select>
              <option>Más recientes</option>
              <option>Menor precio</option>
              <option>Mayor precio</option>
              <option>Menor kilometraje</option>
            </select>
          </div>
        </div>

        {vehiclesData.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No encontramos vehículos con estos filtros.</h2>
            <p>Intenta ajustar tu búsqueda o limpiar los filtros.</p>
            <button className="btn-secondary">Limpiar filtros</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {vehiclesData.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
