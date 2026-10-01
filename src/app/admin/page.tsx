import React from "react";
import styles from "./page.module.css";
import { db } from "@/db";
import { users, vehicles as vehiclesTable, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { approveVehicle, rejectVehicle } from "./actions";

export default async function AdminDashboardPage() {
  // 1. Estadísticas Generales Reales
  const allVehicles = await db.select().from(vehiclesTable);
  const totalVehiclesCount = allVehicles.length;
  const pendingCount = allVehicles.filter(v => v.status === "PENDIENTE").length;
  
  const allUsers = await db.select().from(users);
  const totalUsersCount = allUsers.length;

  // 2. Obtener Vehículos Pendientes
  const pendingVehicles = await db
    .select({
      id: vehiclesTable.id,
      slug: vehiclesTable.slug,
      brandName: brands.name,
      modelName: models.name,
      version: vehiclesTable.version,
      city: vehiclesTable.city,
      price: vehiclesTable.price,
      createdAt: vehiclesTable.createdAt,
      userName: users.name,
      userLastName: users.lastName,
    })
    .from(vehiclesTable)
    .where(eq(vehiclesTable.status, "PENDIENTE"))
    .leftJoin(brands, eq(vehiclesTable.brandId, brands.id))
    .leftJoin(models, eq(vehiclesTable.modelId, models.id))
    .leftJoin(users, eq(vehiclesTable.userId, users.id))
    .orderBy(desc(vehiclesTable.createdAt));

  return (
    <div className={`container ${styles.adminContainer}`}>
      {/* Barra Lateral Admin */}
      <aside className={styles.sidebar}>
        <div className={styles.adminHeader}>
          <div className={styles.logoAccent}>Panel Admin</div>
          <p className={styles.adminRole}>Super Administrador</p>
        </div>
        
        <nav className={styles.navMenu}>
          <a href="/admin" className={`${styles.navItem} ${styles.active}`}>Dashboard</a>
          <a href="#" className={styles.navItem}>Vehículos</a>
          <a href="/admin/marcas" className={styles.navItem}>Marcas</a>
          <a href="#" className={styles.navItem}>Usuarios</a>
          <a href="#" className={styles.navItem}>Leads / Interesados</a>
          <a href="#" className={styles.navItem}>Configuración</a>
        </nav>
      </aside>

      {/* Contenido Principal Admin */}
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Visión General</h1>
        </div>

        {/* KPIs */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Vehículos</h3>
            <p className={styles.statNumber}>{totalVehiclesCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pendientes de Aprobación</h3>
            <p className={styles.statNumber}>{pendingCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Usuarios Registrados</h3>
            <p className={styles.statNumber}>{totalUsersCount}</p>
          </div>
        </div>

        {/* Tabla de Vehículos Pendientes */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>Vehículos Pendientes de Aprobación</h2>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Usuario</th>
                  <th>Precio</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay vehículos pendientes de aprobación.</td>
                  </tr>
                ) : (
                  pendingVehicles.map(v => {
                    const formattedPrice = new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(v.price || 0);

                    const dateStr = v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A';

                    return (
                      <tr key={v.id}>
                        <td>
                          <div className={styles.tdVehicle}>
                            <div className={styles.miniImg}></div>
                            <div>
                              <strong>{v.brandName} {v.modelName} {v.version}</strong>
                              <br/><span className={styles.textSmall}>{v.city}</span>
                            </div>
                          </div>
                        </td>
                        <td>{v.userName} {v.userLastName}</td>
                        <td>{formattedPrice}</td>
                        <td>{dateStr}</td>
                        <td>
                          <div className={styles.actions}>
                            <form action={approveVehicle.bind(null, v.id)}>
                              <button type="submit" className={styles.btnApprove}>Aprobar</button>
                            </form>
                            <form action={rejectVehicle.bind(null, v.id)}>
                              <button type="submit" className={styles.btnReject}>Rechazar</button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
