import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import VehicleCard from "@/components/VehicleCard";

export default function Home() {
  // Datos demo para el showcase visual
  const featuredVehicles = [
    {
      id: 1,
      slug: "mazda-cx-5-grand-touring-2024",
      brandName: "Mazda",
      modelName: "CX-5",
      version: "Grand Touring LX",
      year: 2024,
      mileage: 1200,
      price: 145000000,
      city: "Bogotá",
      transmission: "Automática",
      imageUrl: "https://images.unsplash.com/photo-1599912027806-ce07d152e43b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      slug: "toyota-prado-txl-2023",
      brandName: "Toyota",
      modelName: "Prado",
      version: "TX-L 3.0",
      year: 2023,
      mileage: 15000,
      price: 320000000,
      city: "Medellín",
      transmission: "Automática",
      imageUrl: "https://images.unsplash.com/photo-1590362891991-f7000e1814e5?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      slug: "mercedes-benz-gle-450-2024",
      brandName: "Mercedes-Benz",
      modelName: "GLE 450",
      version: "4MATIC AMG Line",
      year: 2024,
      mileage: 5000,
      price: 450000000,
      city: "Cali",
      transmission: "Automática",
      imageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      slug: "bmw-x5-xdrive40i-2023",
      brandName: "BMW",
      modelName: "X5",
      version: "xDrive40i M Sport",
      year: 2023,
      mileage: 22000,
      price: 380000000,
      city: "Bogotá",
      transmission: "Automática",
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const categories = [
    { name: "Carros y Camionetas", count: 12450, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=500&auto=format&fit=crop" },
    { name: "Motos", count: 3200, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=500&auto=format&fit=crop" },
    { name: "Deportivos", count: 850, image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=500&auto=format&fit=crop" },
    { name: "Pick-ups", count: 2100, image: "https://images.unsplash.com/photo-1620882813824-c15668e1ebdc?q=80&w=500&auto=format&fit=crop" },
  ];

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
          <h1 className={styles.heroTitle}>Encuentra tu próximo vehículo</h1>
          <p className={styles.heroSubtitle}>
            Explora vehículos, encuentra el que buscas y contacta directamente con el concesionario.
          </p>

          {/* Buscador Integrado Premium */}
          <div className={styles.searchBoxWrapper}>
            <form className={styles.searchBox} action="/vehiculos" method="GET">
              <div className={styles.searchField}>
                <label>Marca</label>
                <select name="marca" defaultValue="">
                  <option value="" disabled>Cualquier Marca</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className={styles.searchDivider}></div>
              <div className={styles.searchField}>
                <label>Modelo</label>
                <input type="text" name="modelo" placeholder="Ej: CX-5" />
              </div>
              <div className={styles.searchDivider}></div>
              <div className={styles.searchField}>
                <label>Ciudad</label>
                <input type="text" name="ciudad" placeholder="Todas las ciudades" />
              </div>
              <div className={styles.searchFieldBtn}>
                <button type="submit" className={styles.searchBtn}>
                  Buscar vehículos
                </button>
              </div>
            </form>
            <div className={styles.advancedSearch}>
              <Link href="/vehiculos">Ver filtros avanzados →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explora por categoría</h2>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <Link href="/vehiculos" key={cat.name} className={styles.categoryCard}>
              <Image src={cat.image} alt={cat.name} fill className={styles.categoryImg} />
              <div className={styles.categoryOverlay}></div>
              <div className={styles.categoryContent}>
                <h3>{cat.name}</h3>
                <p>{cat.count.toLocaleString()} vehículos</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className={styles.featuredSection}>
        <div className={`container`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Vehículos destacados</h2>
            <Link href="/vehiculos" className={styles.viewAllLink}>Ver todos</Link>
          </div>
          <div className={styles.featuredGrid}>
            {featuredVehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v as any} />
            ))}
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Encuentra tu marca</h2>
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
