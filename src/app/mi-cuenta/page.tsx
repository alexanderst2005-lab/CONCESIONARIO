import React from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { db } from "@/db";
import { users, vehicles as vehiclesTable, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MiCuentaPage() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 1. Obtener datos reales del usuario
  const userRecord = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!userRecord) {
    redirect("/login");
  }

  const initials = `${userRecord.name.charAt(0)}${userRecord.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${userRecord.name} ${userRecord.lastName}`;
  const userRole = userRecord.role === "ADMIN" ? "Administrador" : "Vendedor Regular";

  // 2. Obtener vehículos de este usuario exclusivamente
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

  // 3. Calcular estadísticas reales
  const activeCount = userVehicles.filter((v) => v.status === "ACTIVO" || v.status === "approved").length;
  const pendingCount = userVehicles.filter((v) => v.status === "PENDIENTE").length;
  const soldCount = userVehicles.filter((v) => v.status === "VENDIDO").length;

  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{fullName}</p>
            <p className={styles.userRole}>{userRole}</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <Link href="/mi-cuenta" className={`${styles.navItem} ${styles.active}`}>Mis Vehículos</Link>
          <Link href="/favoritos" className={styles.navItem}>Favoritos</Link>
          <Link href="#" className={styles.navItem}>Mi Perfil</Link>
          <Link href="#" className={styles.navItem}>Configuración</Link>
          {/* Note: Logout client side action usually handled by next-auth signOut, here styled only */}
          <Link href="/api/auth/signout" className={`${styles.navItem} ${styles.logout}`}>Cerrar Sesión</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Mis Vehículos</h1>
          <Link href="/publicar" className="btn-primary">
            + Publicar nuevo
          </Link>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Activos</h3>
            <p className={styles.statNumber}>{activeCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>En revisión</h3>
            <p className={styles.statNumber}>{pendingCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Vendidos</h3>
            <p className={styles.statNumber}>{soldCount}</p>
          </div>
        </div>

        <div className={styles.vehicleList}>
          {userVehicles.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border-color)", borderRadius: "var(--border-radius-md)" }}>
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
                  <div className={styles.listImagePlaceholder}>Auto</div>
                  <div className={styles.listInfo}>
                    <h4>{v.brandName || "Marca Desconocida"} {v.modelName || "Modelo Desconocido"} {v.version}</h4>
                    <p>{v.year} • {(v.mileage || 0).toLocaleString()} km • {v.city}</p>
                    {isActive && <span className={`${styles.badge} ${styles.badgeActive}`}>Activo</span>}
                    {isPending && <span className={`${styles.badge} ${styles.badgePending}`}>En Revisión</span>}
                    {v.status === "VENDIDO" && <span className={`${styles.badge} ${styles.badgeSold}`}>Vendido</span>}
                  </div>
                  <div className={styles.listPrice}>
                    <p>{formattedPrice}</p>
                  </div>
                  <div className={styles.listActions}>
                    <Link href={`/vehiculo/${v.slug}`} className="btn-secondary">Ver</Link>
                    {isActive && <button className="btn-secondary">Pausar</button>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
