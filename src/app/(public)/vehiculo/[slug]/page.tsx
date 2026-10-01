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
  const rawPhone = siteSettings?.whatsappNumber || "573000000000";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const whatsappMsg = `Hola, estoy interesado en el ${vehicle.brandName} ${vehicle.modelName} ${vehicle.year} publicado por ${formattedPrice}.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  // Formato para ocultar placa (solo mostrar último dígito)
  const plateLastDigit = vehicle.plate ? vehicle.plate.slice(-1) : "-";

  return (
    <div className={styles.detailContainer}>
      <HistoryTracker vehicle={vehicle} />

      {/* GALERÍA DE IMÁGENES */}
      <div className={styles.mobileGallery}>
        <div className={styles.galleryFrame}>
          <Link href="/vehiculos" className={styles.backBtn}>
            <ChevronLeft size={24} />
          </Link>
          <ImageGallery images={displayImages} />
        </div>
      </div>

      <div className={styles.topInfo}>
        <div className={styles.statsRow}>
          <span>{vehicle.year} - {vehicle.mileage?.toLocaleString('es-CO')} Km</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={16} /> 7.014
          </span>
        </div>

        <h1 className={styles.title}>{vehicle.brandName} {vehicle.modelName} {vehicle.version} <br/> {vehicle.year}</h1>
        
        <div className={styles.seller}>
          Publicado por: <span>{vehicle.sellerName}</span>
        </div>

        <div className={styles.price}>{formattedPrice} COP</div>

        <div className={styles.skuRow}>
          <span className={styles.sku}>SKU: 0{vehicle.id}84{vehicle.id}</span>
          <div className={styles.logoIcon}>
            <User size={20} color="#fff" />
          </div>
        </div>

        <div className={styles.divider}></div>

        <h2 className={styles.sectionTitle}>Características</h2>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Marca:</span>
            <span className={styles.specValue}>{vehicle.brandName}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Modelo:</span>
            <span className={styles.specValue}>{vehicle.modelName}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Año:</span>
            <span className={styles.specValue}>{vehicle.year}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Estado:</span>
            <span className={styles.specValue}>usado</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Tipo precio:</span>
            <span className={styles.specValue}>Negociable</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Cilindraje:</span>
            <span className={styles.specValue}>{vehicle.engineCapacity ? `${vehicle.engineCapacity} cc` : '-'}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Kilometraje:</span>
            <span className={styles.specValue}>{vehicle.mileage?.toLocaleString('es-CO')} km</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Combustible:</span>
            <span className={styles.specValue}>{vehicle.fuelType || '-'}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Transmisión:</span>
            <span className={styles.specValue}>{vehicle.transmission || '-'}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Color:</span>
            <span className={styles.specValue}>{vehicle.color || 'Negro'}</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Último dígito de placa:</span>
            <span className={styles.specValue}>{plateLastDigit}</span>
          </div>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Blindaje:</span>
            <span className={styles.specValue}>NO</span>
          </div>
        </div>

        <div className={styles.specRow}>
          <div className={styles.specColumn}>
            <span className={styles.specLabel}>Peritaje:</span>
            <span className={styles.specValue}>No</span>
          </div>
          <div className={styles.specColumn} style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
             <div className={styles.logoIcon}>
              <User size={20} color="#000" />
            </div>
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
        <div className={styles.whatsappCtaBox}>
          <h3>¿Te interesa este vehículo?</h3>
          <p>Habla con nuestro equipo y recibe más información.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappCtaBtn}>
            <MessageCircle size={20} /> CONTACTAR POR WHATSAPP
          </a>
        </div>
      </div>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.floatingWhatsapp}>
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
