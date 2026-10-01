import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";
import BrandCarousel from "@/components/BrandCarousel";
import { db } from "@/db";
import { vehicles as vehiclesTable, brands as brandsTable } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { Search, MapPin, Car, Settings2 } from "lucide-react";

export default async function Home() {
  const featuredVehicles = await db
    .select()
    .from(vehiclesTable)
    .where(and(eq(vehiclesTable.status, "ACTIVO"), eq(vehiclesTable.isFeatured, true)))
    .orderBy(desc(vehiclesTable.createdAt))
    .limit(4);

  const recentVehicles = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.status, "ACTIVO"))
    .orderBy(desc(vehiclesTable.createdAt))
    .limit(8);

  // Obtener marcas activas desde la base de datos
  const activeBrands = await db
    .select()
    .from(brandsTable)
    .where(eq(brandsTable.isActive, true))
    .orderBy(asc(brandsTable.sortOrder), asc(brandsTable.name));

  const { categories: categoriesTable } = await import("@/db/schema");
  const activeCategories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isActive, true))
    .orderBy(asc(categoriesTable.name));

  // Fallback: si no hay marcas en DB, usar lista estática
  const brandNames = activeBrands.length > 0
    ? activeBrands.map(b => b.name)
    : ["Mazda", "Toyota", "Renault", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Ford", "Nissan", "Volkswagen"];

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
                  {brandNames.map(b => <option key={b} value={b}>{b}</option>)}
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

      {/* MARCAS — CARRUSEL PREMIUM */}
      <section style={{ padding: "6rem 0", backgroundColor: "#050505", borderTop: "1px solid #111" }}>
        <div className="container" style={{ marginBottom: "2.5rem" }}>
          <div className={styles.sectionHeader}>
            <h2 className={`${styles.sectionTitle} serif-title`}>Encuentra tu marca</h2>
            <Link href="/vehiculos" className={styles.viewAllLink}>Ver todas las marcas →</Link>
          </div>
        </div>
        <BrandCarousel brands={activeBrands} />
      </section>


      {/* NUEVOS INGRESOS */}
      <section className={styles.featuredSection} style={{ backgroundColor: "#080808", borderTop: "1px solid #111" }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={`${styles.sectionTitle} serif-title`}>Nuevos Ingresos</h2>
            <Link href="/vehiculos" className={styles.viewAllLink}>Ver todo el inventario</Link>
          </div>
          <div className={styles.featuredGrid}>
            {recentVehicles.length > 0 ? (
              recentVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v as any} />
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No hay vehículos recientes por el momento.</p>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="container" style={{ padding: "4rem 1rem" }}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Encuentra por tipo</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {activeCategories.length > 0 ? (
            activeCategories.map(cat => (
              <Link href={`/vehiculos?categoria=${cat.name}`} key={cat.id} style={{ position: "relative", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#111", border: "1px solid #222", overflow: "hidden", textDecoration: "none", borderRadius: "8px", transition: "transform 0.3s" }} className={styles.hoverGold}>
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}></div>
                <span style={{ position: "relative", zIndex: 1, color: "white", fontWeight: 700, letterSpacing: "1px" }}>{cat.name.toUpperCase()}</span>
              </Link>
            ))
          ) : (
            ["AUTOMÓVILES", "SUV", "CAMIONETAS", "MOTOS", "COMERCIALES"].map(cat => (
              <Link href={`/vehiculos?categoria=${cat}`} key={cat} style={{ position: "relative", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#111", border: "1px solid #222", overflow: "hidden", textDecoration: "none", borderRadius: "8px" }}>
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}></div>
                <span style={{ position: "relative", zIndex: 1, color: "white", fontWeight: 700, letterSpacing: "1px" }}>{cat}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* CTA PUBLICAR */}
      <section style={{ backgroundColor: "#050505", borderTop: "1px solid var(--gold-accent)", padding: "5rem 1rem", textAlign: "center" }}>
        <h2 className="serif-title" style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "white" }}>¿TIENES UN VEHÍCULO PARA VENDER?</h2>
        <p style={{ color: "#888", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem auto" }}>Publícalo y permite que compradores interesados conozcan todos sus detalles.</p>
        <Link href="/publicar" className="btn-primary" style={{ display: "inline-block", padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
          PUBLICAR VEHÍCULO
        </Link>
      </section>
    </>
  );
}
