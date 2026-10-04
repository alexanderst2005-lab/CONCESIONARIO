import { db } from "@/db";
import { vehicles, brands, models, settings, vehicleImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import styles from "./page.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye, MessageCircle, User } from "lucide-react";
import ImageGallery from "./ImageGallery";
import HistoryTracker from "./HistoryTracker";

export const dynamic = 'force-dynamic';

export default async function VehiculoDetalle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicleRecord = await db.query.vehicles.findFirst({
    where: eq(vehicles.slug, slug),
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
    id: vehicleRecord.id,
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
    accessories: vehicleRecord.accessories,
    hasGas: vehicleRecord.hasGas,
    hasGps: vehicleRecord.hasGps,
    locationStatus: vehicleRecord.locationStatus,
    cityRegistered: vehicleRecord.cityRegistered,
    status: vehicleRecord.status,
    sellerName: vehicleRecord.user ? `${vehicleRecord.user.name} ${vehicleRecord.user.lastName}` : "Vendedor Anónimo",
    images: vehicleRecord.images?.map(img => img.url) || [],
    features: vehicleRecord.features?.map(f => f.feature?.name) || []
  };

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(vehicle.price || 0);

  const fallbackImage = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop";
  const displayImages = vehicle.images.length > 0 ? vehicle.images : [fallbackImage];

  const siteSettings = await db.query.settings.findFirst();
  const sellerPhone = (vehicleRecord.contactPhone || vehicleRecord.user?.phone || "").replace(/\D/g, "");
  const fallbackPhone = (siteSettings?.whatsappNumber || "573000000000").replace(/\D/g, "");
  let cleanPhone = sellerPhone || fallbackPhone;
  // Números colombianos de 10 dígitos (ej. 300 123 4567) necesitan el prefijo 57
  if (cleanPhone.length === 10) cleanPhone = `57${cleanPhone}`;
  const sellerFirstName = vehicleRecord.user?.name?.split(" ")[0];
  const whatsappMsg = `Hola${sellerFirstName ? ` ${sellerFirstName}` : ""}, estoy interesado(a) en el vehículo ${vehicle.brandName} ${vehicle.modelName} ${vehicle.year} que vi en AutosElPatron. ¿Me podrías dar más información?`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  // Formato para ocultar placa (solo mostrar último dígito)
  const plateLastDigit = vehicle.plate ? vehicle.plate.slice(-1) : "-";

  return (
    <div className={styles.detailContainer}>
      <HistoryTracker vehicle={vehicle} />

      <div className={styles.desktopGrid}>
        {/* GALERÍA DE IMÁGENES */}
        <div className={`${styles.mobileGallery} ${styles.galleryArea}`}>
          <div className={styles.galleryFrame}>
            <ImageGallery images={displayImages} />
          </div>
        </div>

        <div className={styles.infoArea}>
        <div className={styles.topInfo}>
        <div className={styles.statsRow}>
          <span>{vehicle.year} - {vehicle.mileage?.toLocaleString('es-CO')} Km</span>
        </div>

        <h1 className={styles.title}>{vehicle.brandName} {vehicle.modelName} {vehicle.version} <br/> {vehicle.year}</h1>
        
        <div className={styles.seller}>
          Publicado por: <span>{vehicle.sellerName}</span>
        </div>

        <div className={styles.price}>{formattedPrice} COP</div>


        <div className={styles.divider}></div>
          {vehicle.status === "VENDIDO" ? (
            <div className={styles.whatsappCtaBox} style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444' }}>Vehículo Vendido</h3>
              <p>Este vehículo ya no se encuentra disponible.</p>
              <button disabled className={styles.whatsappCtaBtn} style={{ background: '#555', cursor: 'not-allowed', color: '#aaa' }}>
                NO DISPONIBLE
              </button>
            </div>
          ) : (
            <div className={styles.whatsappCtaBox}>
              <h3>¿Te interesa este vehículo?</h3>
              <p>Habla directamente con el vendedor y recibe más información.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappCtaBtn}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                CONTACTAR POR WHATSAPP
              </a>
            </div>
          )}
        </div>
        </div>

        <div className={`${styles.extraInfo} ${styles.extraArea}`}>
        <h2 className={styles.sectionTitle}>Características</h2>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Vehículo:</span>
            <span className={styles.specValue}>{vehicle.brandName} {vehicle.modelName} {vehicle.version}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Modelo:</span>
            <span className={styles.specValue}>{vehicle.year}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Kilometraje:</span>
            <span className={styles.specValue}>{vehicle.mileage?.toLocaleString('es-CO')} km</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Cilindraje:</span>
            <span className={styles.specValue}>{vehicle.engineCapacity ? `${vehicle.engineCapacity} cc` : '-'}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Transmisión:</span>
            <span className={styles.specValue}>{vehicle.transmission || '-'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Combustible:</span>
            <span className={styles.specValue}>{vehicle.fuelType || '-'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Soat:</span>
            <span className={styles.specValue}>{vehicle.soat ? 'Vigente' : 'No vigente'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Tecnomecánica:</span>
            <span className={styles.specValue}>{vehicle.tecnomecanica ? 'Vigente' : 'No vigente'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Dueños:</span>
            <span className={styles.specValue}>{vehicle.ownersCount || '1'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Prenda:</span>
            <span className={styles.specValue}>{vehicle.prenda ? 'Sí' : 'No'}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Accesorios:</span>
            <span className={styles.specValue}>{vehicle.accessories || '-'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Placa:</span>
            <span className={styles.specValue}>{vehicle.plate ? (vehicle.plate.length > 1 ? `*** *** ${vehicle.plate.charAt(vehicle.plate.length - 1)}` : vehicle.plate) : '-'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Matriculado:</span>
            <span className={styles.specValue}>{vehicle.cityRegistered || vehicle.city || '-'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Color:</span>
            <span className={styles.specValue}>{vehicle.color || '-'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Si tuvo gas:</span>
            <span className={styles.specValue}>{vehicle.hasGas ? 'Sí' : 'No'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Si tiene GPS:</span>
            <span className={styles.specValue}>{vehicle.hasGps ? 'Sí' : 'No'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Cita o Vitrina:</span>
            <span className={styles.specValue}>{vehicle.locationStatus || '-'}</span>
          </div>
        </div>
        
        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Precio comercial:</span>
            <span className={styles.specValue}>{formattedPrice} COP</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle} style={{marginTop: '2rem'}}>Descripción</h2>

        <div className={styles.descriptionBox}>
          {vehicle.description ? (
            <p>{vehicle.description}</p>
          ) : (
            <p>
              {vehicle.mileage?.toLocaleString('es-CO')} km | Único dueño | Excelente estado {vehicle.brandName} {vehicle.modelName} modelo {vehicle.year}, muy bien cuidado.<br/><br/>
              Vehículo en estado impecable. Equipamiento destacado: {vehicle.features.join(", ")}
            </p>
          )}
        </div>
      </div>

      </div>
    </div>
  );
}
