import React from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { db } from "@/db";
import { users, vehicles as vehiclesTable, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileForm from "./ProfileForm";
import HistoryTab from "./HistoryTab";
import DeleteVehicleBtn from "./DeleteVehicleBtn";

import SubscriptionsTab from "./SubscriptionsTab";
import WompiWidgetModal from "./WompiWidgetModal"; // Modal to show plans and Wompi

export default async function MiCuentaPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!userRecord) {
    redirect("/login");
  }

  const params = await searchParams;
  const tab = params.tab || "publicaciones";

  const initials = `${userRecord.name.charAt(0)}${userRecord.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${userRecord.name} ${userRecord.lastName}`;
  const userRole = userRecord.role === "ADMIN" ? "Administrador" : "Vendedor Regular";

  let mainContent;

  if (tab === "perfil") {
    mainContent = <ProfileForm user={userRecord} />;
  } else if (tab === "historial") {
    mainContent = <HistoryTab />;
  } else if (tab === "suscripciones") {
    mainContent = <SubscriptionsTab userId={userRecord.id} />;
  } else {
    // Default: Publicaciones
    const userVehiclesRaw = await db.query.vehicles.findMany({
      where: eq(vehiclesTable.userId, userRecord.id),
      orderBy: [desc(vehiclesTable.createdAt)],
      with: {
        brand: true,
        model: true,
        images: true
      }
    });

    const userVehicles = userVehiclesRaw.map(v => ({
      id: v.id,
      slug: v.slug,
      brandName: v.brand?.name || "Desconocida",
      modelName: v.model?.name || "Desconocido",
      version: v.version,
      year: v.year,
      mileage: v.mileage,
      city: v.city,
      price: v.price,
      status: v.status,
      isFeatured: v.isFeatured,
      image: v.images && v.images.length > 0 ? v.images[0].url : "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop"
    }));

    const activeCount = userVehicles.filter((v) => v.status === "ACTIVO" || v.status === "approved").length;
    const pendingCount = userVehicles.filter((v) => v.status === "PENDIENTE").length;
    const soldCount = userVehicles.filter((v) => v.status === "VENDIDO").length;

    mainContent = (
      <>
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <h1 className="serif-title">Mis publicaciones</h1>
            <p>Administra y consulta tus vehículos en venta.</p>
          </div>
          <Link href="/publicar" className="btn-primary">
            PUBLICAR VEHÍCULO
          </Link>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Activos</h3>
            <p className={styles.statNumber}>{activeCount.toString().padStart(2, '0')}</p>
          </div>
          <div className={styles.statCard}>
            <h3>En revisión</h3>
            <p className={styles.statNumber}>{pendingCount.toString().padStart(2, '0')}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Vendidos</h3>
            <p className={styles.statNumber}>{soldCount.toString().padStart(2, '0')}</p>
          </div>
        </div>

        <div className={styles.vehicleList}>
          {userVehicles.length === 0 ? (
            <p style={{ padding: "3rem", textAlign: "center", color: "#666", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "4px" }}>
              No has publicado ningún vehículo todavía.
            </p>
          ) : (
            userVehicles.map((v) => {
              const isActive = v.status === "ACTIVO" || v.status === "approved";
              const isPending = v.status === "PENDIENTE";
              
              const formattedPrice = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(v.price || 0);

              return (
                <div key={v.id} className={styles.vehicleListItem}>
                  <div className={styles.listImageContainer} style={{ width: '120px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', backgroundColor: '#111', position: 'relative' }}>
                    <img src={v.image} alt={v.modelName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {v.isFeatured && (
                      <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--gold-accent)', color: '#000', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 'bold' }}>⭐ DESTACADO</div>
                    )}
                  </div>
                  <div className={styles.listInfo}>
                    <h4>{v.brandName || "Marca Desconocida"} {v.modelName || "Modelo Desconocido"} {v.version}</h4>
                    <p>{v.year} • {(v.mileage || 0).toLocaleString()} KM • {v.city}</p>
                    <div className={styles.badgesWrapper}>
                      {isActive && <span className={`${styles.badge} ${styles.badgeActive}`}>ACTIVO</span>}
                      {isPending && <span className={`${styles.badge} ${styles.badgePending}`}>EN REVISIÓN</span>}
                      {v.status === "VENDIDO" && <span className={`${styles.badge} ${styles.badgeSold}`} style={{backgroundColor: '#ef4444'}}>VENDIDO</span>}
                      {v.status === "PAUSADO" && <span className={styles.badge} style={{backgroundColor: '#555', color: '#fff'}}>PAUSADO</span>}
                      {v.status === "RECHAZADO" && <span className={styles.badge} style={{backgroundColor: 'rgba(248,113,113,0.2)', color: '#f87171'}}>RECHAZADO</span>}
                    </div>
                  </div>
                  <div className={styles.listPrice}>
                    <p>{formattedPrice}</p>
                  </div>
                  <div className={styles.listActions}>
                    {isActive && !v.isFeatured && (
                      <WompiWidgetModal vehicleId={v.id} vehicleName={`${v.brandName} ${v.modelName}`} />
                    )}
                    <Link href={`/vehiculo/${v.slug}`} className={styles.actionBtn}>VER</Link>
                    <Link href={`/editar-vehiculo/${v.slug}`} className={styles.actionBtn} style={{backgroundColor: '#333'}}>EDITAR</Link>
                    <DeleteVehicleBtn id={v.id} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </>
    );
  }

  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <DashboardSidebar initials={initials} fullName={fullName} userRole={userRole} />
      <main className={styles.mainContent}>
        {mainContent}
      </main>
    </div>
  );
}
