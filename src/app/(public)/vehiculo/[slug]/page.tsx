import { db } from "@/db";
import { vehicles, brands, models, settings, vehicleImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import styles from "./page.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import HistoryTracker from "./HistoryTracker";
import { Share2, MapPin, Calendar, Gauge, Cog, Droplets, User, Info, CheckCircle2, ChevronLeft, Heart, ShieldCheck } from "lucide-react";
import ImageGallery from "./ImageGallery";

export const dynamic = 'force-dynamic';

export default async function VehiculoDetalle({ params }: { params: { slug: string } }) {
  const vehicleRecord = await db.query.vehicles.findFirst({
    where: eq(vehicles.slug, params.slug),
    with: {
      brand: true,
      model: true,
      user: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.order)]
      },
      features: {
        with: {
          feature: true
        }
      }
    }
  });

  if (!vehicleRecord) {
    notFound();
  }

  const vehicle = {
    slug: vehicleRecord.slug,
    brandName: vehicleRecord.brand?.name || "Desconocida",
    modelName: vehicleRecord.model?.name || "Desconocido",
    version: vehicleRecord.version,
    year: vehicleRecord.year,
    mileage: vehicleRecord.mileage,
    price: vehicleRecord.price,
    city: vehicleRecord.city,
    fuelType: vehicleRecord.fuelType,
    transmission: vehicleRecord.transmission,
    engineCapacity: vehicleRecord.engineCapacity,
    color: vehicleRecord.color,
    description: vehicleRecord.description,
    ownersCount: vehicleRecord.ownersCount,
    plate: vehicleRecord.plate,
    soat: vehicleRecord.soat,
    tecnomecanica: vehicleRecord.tecnomecanica,
    prenda: vehicleRecord.prenda,
    status: vehicleRecord.status,
    sellerName: vehicleRecord.user ? `${vehicleRecord.user.name} ${vehicleRecord.user.lastName}` : "Vendedor Anónimo",
    images: vehicleRecord.images?.map(img => img.url) || [],
    features: vehicleRecord.features?.map(f => f.feature?.name) || []
  };

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  let config = await db.query.settings.findFirst();
  if (!config) {
    config = { 
      id: 1,
      whatsappNumber: "573000000000", 
      defaultMessage: "Hola, estoy interesado en el [MARCA] [MODELO] [AÑO] (Precio: [PRECIO]) que vi publicado en la plataforma. Quisiera recibir más información. Enlace: [URL]" 
    };
  }

  const vehicleUrl = `https://concesionario-cyan.vercel.app/vehiculo/${vehicle.slug}`;

  let rawMessage = config.defaultMessage || "Hola, estoy interesado en el [MARCA] [MODELO] [AÑO]";
  rawMessage = rawMessage.replace("[MARCA]", vehicle.brandName);
  rawMessage = rawMessage.replace("[MODELO]", vehicle.modelName);
  rawMessage = rawMessage.replace("[AÑO]", vehicle.year.toString());
  rawMessage = rawMessage.replace("[PRECIO]", formattedPrice);
  rawMessage = rawMessage.replace("[URL]", vehicleUrl);

  const whatsappMessage = encodeURIComponent(rawMessage);
  const whatsappLink = `https://wa.me/${config.whatsappNumber}?text=${whatsappMessage}`;

  const fallbackImage = "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80";
  const displayImages = vehicle.images.length > 0 ? vehicle.images : [fallbackImage];

  return (
    <div className={styles.pageContainer}>
      <HistoryTracker vehicle={vehicle} />
      
      {/* HEADER BREADCRUMBS */}
      <div className="container">
        <div className={styles.breadcrumbs}>
          <Link href="/vehiculos"><ChevronLeft size={16} /> Volver a vehículos</Link>
          <span className={styles.separator}>/</span>
          <Link href={`/vehiculos?marca=${vehicle.brandName}`}>{vehicle.brandName}</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{vehicle.modelName}</span>
        </div>
      </div>

      <div className={`container ${styles.gridContainer}`}>
        {/* LEFT COLUMN - GALLERY & DETAILS */}
        <div className={styles.leftColumn}>
          
          <div className={styles.galleryWrapper}>
             <ImageGallery images={displayImages} />
             
             {vehicle.status !== 'ACTIVO' && (
               <div className={styles.statusBadge}>
                 Estado: {vehicle.status}
               </div>
             )}
          </div>

          <div className={styles.mainSpecsGrid}>
            <div className={styles.specItem}>
              <Calendar size={20} />
              <div>
                <p className={styles.specLabel}>Año</p>
                <p className={styles.specValue}>{vehicle.year}</p>
              </div>
            </div>
            <div className={styles.specItem}>
              <Gauge size={20} />
              <div>
                <p className={styles.specLabel}>Kilometraje</p>
                <p className={styles.specValue}>{vehicle.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div className={styles.specItem}>
              <Cog size={20} />
              <div>
                <p className={styles.specLabel}>Transmisión</p>
                <p className={styles.specValue}>{vehicle.transmission}</p>
              </div>
            </div>
            <div className={styles.specItem}>
              <Droplets size={20} />
              <div>
                <p className={styles.specLabel}>Combustible</p>
                <p className={styles.specValue}>{vehicle.fuelType}</p>
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Descripción</h2>
            <div className={styles.descriptionBox}>
              <p>{vehicle.description || "El vendedor no ha proporcionado una descripción adicional para este vehículo."}</p>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Equipamiento y Accesorios</h2>
            {vehicle.features.length > 0 ? (
              <div className={styles.featuresGrid}>
                {vehicle.features.map((feature, idx) => (
                  <div key={idx} className={styles.featureBadge}>
                    <CheckCircle2 size={16} className={styles.goldIcon} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>No se han especificado accesorios.</p>
            )}
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Información Adicional</h2>
            <div className={styles.infoTable}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Cilindraje</span>
                <span className={styles.infoVal}>{vehicle.engineCapacity ? `${vehicle.engineCapacity} cc` : 'No especificado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Color</span>
                <span className={styles.infoVal}>{vehicle.color || 'No especificado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>SOAT Vigente</span>
                <span className={styles.infoVal}>{vehicle.soat ? 'Sí' : 'No / No especificado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Tecnomecánica Vigente</span>
                <span className={styles.infoVal}>{vehicle.tecnomecanica ? 'Sí' : 'No / No especificado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Tiene Prenda</span>
                <span className={styles.infoVal}>{vehicle.prenda ? 'Sí' : 'No'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Número de Dueños</span>
                <span className={styles.infoVal}>{vehicle.ownersCount || 'No especificado'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Placa terminada en</span>
                <span className={styles.infoVal}>{vehicle.plate ? vehicle.plate.slice(-1) : 'No especificada'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - STICKY PRICE & CONTACT */}
        <div className={styles.rightColumn}>
          <div className={styles.stickyPanel}>
            <div className={styles.brandTitle}>
              <h1 className="serif-title">{vehicle.brandName} {vehicle.modelName}</h1>
              <p className={styles.version}>{vehicle.version}</p>
            </div>
            
            <div className={styles.priceContainer}>
              <h2 className={styles.price}>{formattedPrice}</h2>
            </div>

            <div className={styles.locationBlock}>
              <MapPin size={18} />
              <span>Ubicado en <strong>{vehicle.city}</strong></span>
            </div>

            <div className={styles.actionButtons}>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`btn-primary ${styles.whatsappBtn}`}>
                CONTACTAR POR WHATSAPP
              </a>
              <button className={styles.favoriteBtn}>
                <Heart size={20} />
                GUARDAR EN FAVORITOS
              </button>
            </div>

            <div className={styles.sellerInfo}>
              <div className={styles.sellerHeader}>
                <User size={20} className={styles.sellerIcon} />
                <div>
                  <p className={styles.sellerLabel}>Publicado por</p>
                  <p className={styles.sellerName}>{vehicle.sellerName}</p>
                </div>
              </div>
              <div className={styles.safetyBox}>
                <ShieldCheck size={18} className={styles.goldIcon} />
                <span>Transacción segura a través de Autos del Patrón</span>
              </div>
            </div>
            
            <div className={styles.sku}>
              <p>Código AP-{vehicleRecord.id.toString().padStart(5, "0")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
