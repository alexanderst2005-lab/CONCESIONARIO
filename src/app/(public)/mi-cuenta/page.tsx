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

export default async function MiCuentaPage({ searchParams }: { searchParams: { tab?: string } }) {
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

  const tab = searchParams.tab || "publicaciones";

  const initials = `${userRecord.name.charAt(0)}${userRecord.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${userRecord.name} ${userRecord.lastName}`;
  const userRole = userRecord.role === "ADMIN" ? "Administrador" : "Vendedor Regular";

  let mainContent;

  if (tab === "perfil") {
    mainContent = <ProfileForm user={userRecord} />;
  } else if (tab === "historial") {
    mainContent = <HistoryTab />;
  } else {
    // Default: Publicaciones
    const userVehicles = await db
      .select({
        id: vehiclesTable.id,
        slug: vehiclesTable.slug,
        brandName: brands.name,
        modelName: models.name,
        version: vehiclesTable.version,
        year: vehiclesTable.year,
        mileage: vehiclesTable.mileage,
        city: vehiclesTable.city,
        price: vehiclesTable.price,
        status: vehiclesTable.status,
      })
      .from(vehiclesTable)
      .leftJoin(brands, eq(vehiclesTable.brandId, brands.id))
      .leftJoin(models, eq(vehiclesTable.modelId, models.id))
      .where(eq(vehiclesTable.userId, userRecord.id))
      .orderBy(desc(vehiclesTable.createdAt));

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
                  <div className={styles.listImagePlaceholder}>AUTO</div>
                  <div className={styles.listInfo}>
                    <h4>{v.brandName || "Marca Desconocida"} {v.modelName || "Modelo Desconocido"} {v.version}</h4>
                    <p>{v.year} • {(v.mileage || 0).toLocaleString()} KM • {v.city}</p>
                    <div className={styles.badgesWrapper}>
                      {isActive && <span className={`${styles.badge} ${styles.badgeActive}`}>ACTIVO</span>}
                      {isPending && <span className={`${styles.badge} ${styles.badgePending}`}>EN REVISIÓN</span>}
                      {v.status === "VENDIDO" && <span className={`${styles.badge} ${styles.badgeSold}`}>VENDIDO</span>}
                    </div>
                  </div>
                  <div className={styles.listPrice}>
                    <p>{formattedPrice}</p>
                  </div>
                  <div className={styles.listActions}>
                    <Link href={`/vehiculo/${v.slug}`} className={styles.actionBtn}>VER</Link>
                    <Link href={`/editar-vehiculo/${v.slug}`} className={styles.actionBtn} style={{backgroundColor: '#333'}}>EDITAR</Link>
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
