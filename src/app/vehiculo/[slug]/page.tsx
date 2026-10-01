import { db } from "@/db";
import { vehicles, brands, models } from "@/db/schema";
import { eq } from "drizzle-orm";
import styles from "./page.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import HistoryTracker from "./HistoryTracker";

export default async function VehiculoDetalle({ params }: { params: { slug: string } }) {
  // En un caso real, obtendríamos un solo vehículo basado en el slug:
  // const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.slug, params.slug) });
  
  // Por ahora, usamos datos de demostración si la query falla (ya que el usuario no tiene datos)
  const vehicle = {
    slug: params.slug,
    brandName: "Toyota",
    modelName: "Prado",
    version: "TX-L 3.0",
    year: 2024,
    mileage: 15000,
    price: 320000000,
    city: "Bogotá",
    fuelType: "Diésel",
    transmission: "Automática",
    engineCapacity: 3000,
    color: "Blanco Perla",
    description: "Vehículo en perfecto estado, único dueño. Todos los mantenimientos al día en concesionario autorizado.",
    ownersCount: 1,
    plate: "Terminada en 4",
    soat: true,
  };

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  // Obtener config global de WhatsApp
  // const config = await db.query.settings.findFirst();
  const config = { 
    whatsappNumber: "573000000000", 
    defaultMessage: "Hola, estoy interesado en el [MARCA] [MODELO] [AÑO] (Precio: [PRECIO]) que vi publicado en la plataforma. Quisiera recibir más información. Enlace: [URL]" 
  };

  // Generar URL pública
  const vehicleUrl = `https://autos-del-patron.vercel.app/vehiculo/${vehicle.slug}`;

  // Reemplazar variables en el mensaje predeterminado
  let rawMessage = config.defaultMessage || "Hola, estoy interesado en el [MARCA] [MODELO] [AÑO]";
  rawMessage = rawMessage.replace("[MARCA]", vehicle.brandName);
  rawMessage = rawMessage.replace("[MODELO]", vehicle.modelName);
  rawMessage = rawMessage.replace("[AÑO]", vehicle.year.toString());
  rawMessage = rawMessage.replace("[PRECIO]", formattedPrice);
  rawMessage = rawMessage.replace("[URL]", vehicleUrl);

  const whatsappMessage = encodeURIComponent(rawMessage);
  const whatsappLink = `https://wa.me/${config.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className={`container ${styles.detailContainer}`}>
      <HistoryTracker vehicle={vehicle} />
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link href="/vehiculos">Vehículos</Link> <span>/</span>
        <Link href={`/vehiculos?marca=${vehicle.brandName}`}>{vehicle.brandName}</Link> <span>/</span>
        <span className={styles.current}>{vehicle.modelName}</span>
      </div>

      <div className={styles.grid}>
        
        {/* Columna Izquierda: Galería y Descripción */}
        <div className={styles.leftColumn}>
          
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <div className={styles.imagePlaceholder}>Fotografía Principal</div>
            </div>
            <div className={styles.thumbnails}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.thumbnail}>Foto {i}</div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Descripción</h2>
            <p className={styles.description}>{vehicle.description}</p>
          </div>

          <div className={styles.section}>
            <h2>Características Principales</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Motor</span>
                <span className={styles.featureValue}>{vehicle.engineCapacity} cc</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Color</span>
                <span className={styles.featureValue}>{vehicle.color}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Dueños</span>
                <span className={styles.featureValue}>{vehicle.ownersCount}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>SOAT</span>
                <span className={styles.featureValue}>{vehicle.soat ? "Vigente" : "Vencido"}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Placa</span>
                <span className={styles.featureValue}>{vehicle.plate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Precio, Info Principal y Contacto */}
        <div className={styles.rightColumn}>
          <div className={styles.cardInfo}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>{vehicle.brandName} {vehicle.modelName}</h1>
              <p className={styles.version}>{vehicle.version}</p>
            </div>
            
            <div className={styles.price}>{formattedPrice}</div>
            
            <div className={styles.mainSpecs}>
              <div className={styles.specBox}>
                <span className={styles.specValue}>{vehicle.year}</span>
                <span className={styles.specLabel}>Año</span>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specValue}>{vehicle.mileage.toLocaleString()}</span>
                <span className={styles.specLabel}>Kilómetros</span>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specValue}>{vehicle.transmission}</span>
                <span className={styles.specLabel}>Transmisión</span>
              </div>
              <div className={styles.specBox}>
                <span className={styles.specValue}>{vehicle.fuelType}</span>
                <span className={styles.specLabel}>Combustible</span>
              </div>
            </div>

            <div className={styles.location}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Ubicación: <strong>{vehicle.city}</strong></span>
            </div>

            <div className={styles.actions}>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`btn-primary ${styles.whatsappBtn}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Contactar por WhatsApp
              </a>
              <button className={`btn-secondary ${styles.favoriteBtn}`}>
                Guardar en Favoritos
              </button>
            </div>
            
            <div className={styles.securityWarning}>
              <p><strong>Autos del Patrón te recuerda:</strong> Nunca transfieras dinero sin ver el vehículo físicamente y validar sus documentos ante las autoridades competentes.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
