import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";
import BrandCarousel from "@/components/BrandCarousel";
import VehicleCarousel from "@/components/VehicleCarousel";
import CategoryFilterSelector from "@/components/CategoryFilterSelector";
import { db } from "@/db";
import { vehicles as vehiclesTable, brands as brandsTable } from "@/db/schema";
import { eq, desc, asc, and, inArray } from "drizzle-orm";
import { Search, MapPin, Car, Settings2, CarFront, Truck, Bike } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  
  const featuredRaw = await db.query.vehicles.findMany({
    where: and(inArray(vehiclesTable.status, ["ACTIVO", "VENDIDO"]), eq(vehiclesTable.isFeatured, true)),
    orderBy: [desc(vehiclesTable.createdAt)],
    limit: 4,
    with: { brand: true, model: true, images: true }
  });

  const featuredVehicles = featuredRaw.map(v => ({
    id: v.id, slug: v.slug, year: v.year, mileage: v.mileage, price: v.price, city: v.city, fuelType: v.fuelType, transmission: v.transmission,
    brandName: v.brand?.name, modelName: v.model?.name, status: v.status, isFeatured: v.isFeatured, isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : undefined
  }));

  const recentRaw = await db.query.vehicles.findMany({
    where: inArray(vehiclesTable.status, ["ACTIVO", "VENDIDO"]),
    orderBy: [desc(vehiclesTable.createdAt)],
    limit: 8,
    with: { brand: true, model: true, images: true }
  });

  const recentVehicles = recentRaw.map(v => ({
    id: v.id, slug: v.slug, year: v.year, mileage: v.mileage, price: v.price, city: v.city, fuelType: v.fuelType, transmission: v.transmission,
    brandName: v.brand?.name, modelName: v.model?.name, status: v.status, isFeatured: v.isFeatured, isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : undefined
  }));


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
      {/* ═══════════════════ HERO PREMIUM CINEMATIC ═══════════════════ */}
      <section className={styles.heroSection}>

        {/* Cinematic background image */}
        <div className={styles.heroBg} aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2048&auto=format&fit=crop"
            alt="Vehículo de lujo Autos del Patrón"
            className={styles.heroBgImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        {/* Main content — left aligned on desktop, center on mobile */}
        <div className={`container ${styles.heroContent} animate-fade-in`}>

          {/* Gold eyebrow */}
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} />
            <span className={styles.heroEyebrowText}>CONCESIONARIO PREMIUM</span>
          </div>

          {/* Title — large cinematic */}
          <h1 className={`${styles.heroTitle} serif-title`}>
            ENCUENTRA<br />
            <span className={styles.heroTitleGold}>TU PRÓXIMO</span><br />
            VEHÍCULO
          </h1>

          {/* Subtitle dots */}
          <p className={styles.heroSubtitle}>
            Explora <span className={styles.dot}>•</span> Descubre <span className={styles.dot}>•</span> Elige
          </p>

          {/* CTA buttons */}
          <div className={styles.heroButtons}>
            <Link href="/vehiculos" className={styles.primaryBtn}>
              <span>BUSCAR VEHÍCULO</span>
              <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="/vehiculos" className={styles.secondaryBtn}>
              VER TODO EL INVENTARIO
            </Link>
          </div>

          {/* Trust badges */}
          <div className={styles.heroBadges}>
            <span>Vehículos seleccionados</span>
            <span className={styles.badgeDot}>•</span>
            <span>Compra segura</span>
            <span className={styles.badgeDot}>•</span>
            <span>Atención personalizada</span>
          </div>

        </div>

        {/* Scroll indicator — centered bottom */}
        <a href="#encuentra-por-tipo" className={styles.scrollIndicator} aria-label="Explorar">
          <span className={styles.scrollText}>DESLIZA PARA EXPLORAR</span>
          <span className={styles.scrollArrow}>↓</span>
        </a>

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


      {/* NUESTRA VITRINA */}
      <section className={styles.featuredSection} style={{ backgroundColor: "#080808", borderTop: "1px solid #111" }}>
        <div className="container">
          <div className={styles.sectionHeader} style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
            <h2 className={`${styles.sectionTitle} serif-title`} style={{ marginBottom: 0, fontSize: "2.5rem", color: "#fff" }}>NUESTRA VITRINA</h2>
            <p style={{ color: "#888", fontSize: "1rem", letterSpacing: "0.02em" }}>Descubre los vehículos disponibles en Autos del Patrón.</p>
          </div>
          
          <VehicleCarousel vehicles={recentVehicles as any[]} />
          
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/vehiculos" className={styles.viewAllLink} style={{ display: "inline-block", padding: "0.75rem 2rem", border: "1px solid var(--gold-accent)", borderRadius: "30px", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
              Ver todo el inventario
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="encuentra-por-tipo" className="container" style={{ padding: "4rem 1rem", overflow: "hidden" }}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif-title`}>Encuentra por tipo</h2>
        </div>
        <div className={styles.categoryCarousel}>
          <CategoryFilterSelector categories={activeCategories} brands={activeBrands} />
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
