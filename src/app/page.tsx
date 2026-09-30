import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";
import { db } from "@/db";
import { vehicles as vehiclesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Search, MapPin, Car, Settings2 } from "lucide-react";

export default async function Home() {
  // Obtener vehículos reales de la base de datos
  const featuredVehicles = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.status, "approved"))
    .orderBy(desc(vehiclesTable.createdAt))
    .limit(4);

  const brands = [
    "Mazda", "Toyota", "Renault", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Ford", "Nissan", "Volkswagen"
  ];

  return (
    <>
      {/* HERO CINEMATOGRÁFICO */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <Image 
            src="/hero_bg.jpg" 
            alt="Vehículos Premium" 
            fill 
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        
        <div className={`container ${styles.heroContainer} animate-fade-in`}>
          <h1 className={`${styles.heroTitle} serif-title`}>ENCUENTRA TU PRÓXIMO<br/>VEHÍCULO</h1>
          <p className={`${styles.heroSubtitle} subtitle-caps`}>
            EXPLORA • DESCUBRE • CONTACTA
          </p>

          {/* Buscador Integrado Premium */}
          <div className={styles.searchBoxWrapper}>
            <form className={styles.searchBox} action="/vehiculos" method="GET">
              <div className={styles.searchField}>
                <label><Car size={16} strokeWidth={1.5} /> Marca</label>
                <select name="marca" defaultValue="">
                  <option value="" disabled>Cualquier Marca</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className={styles.searchDivider}></div>
              <div className={styles.searchField}>
                <label><Settings2 size={16} strokeWidth={1.5} /> Modelo</label>
                <input type="text" name="modelo" placeholder="Ej: CX-5" />
              </div>
              <div className={styles.searchDivider}></div>
              <div className={styles.searchField}>
                <label><MapPin size={16} strokeWidth={1.5} /> Ciudad</label>
                <input type="text" name="ciudad" placeholder="Todas las ciudades" />
              </div>
              <div className={styles.searchFieldBtn}>
                <button type="submit" className={styles.searchBtn}>
                  <Search size={18} strokeWidth={2} /> Buscar
                </button>
              </div>
            </form>
            <div className={styles.advancedSearch}>
              <Link href="/vehiculos">Ver filtros avanzados →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className={styles.featuredSection}>
        <div className={`container`}>
          <div className={styles.sectionHeader}>
            <h2 className={`${styles.sectionTitle} serif-title`}>Vehículos destacados</h2>
            <Link href="/vehiculos" className={styles.viewAllLink}>Ver todos</Link>
          </div>
          <div className={styles.featuredGrid}>
            {featuredVehicles.length > 0 ? (
              featuredVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v as any} />
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No hay vehículos destacados por el momento.</p>
            )}
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Encuentra tu marca</h2>
          <Link href="/vehiculos" className={styles.viewAllLink}>Ver todas las marcas</Link>
        </div>
        <div className={styles.brandsGrid}>
          {brands.map(brand => (
            <Link href={`/vehiculos?marca=${brand}`} key={brand} className={styles.brandCard}>
              <span className={styles.brandName}>{brand}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
