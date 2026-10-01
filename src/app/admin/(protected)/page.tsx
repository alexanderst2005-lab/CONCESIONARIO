import React from "react";
import styles from "./page.module.css";
import { db } from "@/db";
import { users, vehicles as vehiclesTable, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { approveVehicle, rejectVehicle, deleteUser } from "./actions";

export default async function AdminDashboardPage() {
  // 1. Estadísticas Generales Reales
  const allVehicles = await db.select().from(vehiclesTable);
  const totalVehiclesCount = allVehicles.length;
  const pendingCount = allVehicles.filter(v => v.status === "PENDIENTE").length;
  const activeCount = allVehicles.filter(v => v.status === "ACTIVO" || v.status === "approved").length;
  const soldCount = allVehicles.filter(v => v.status === "VENDIDO").length;
  
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const totalUsersCount = allUsers.length;

  const recentUsers = allUsers.filter(u => u.role !== 'ADMIN').slice(0, 5);

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
    <>
      <div className={styles.header}>
        <h1 className="serif-title">Dashboard</h1>
      </div>

      {/* KPIs */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Vehículos</h3>
          <p className={styles.statNumber}>{totalVehiclesCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pendientes</h3>
          <p className={styles.statNumber} style={{ color: "var(--gold-accent)" }}>{pendingCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Activos / Aprobados</h3>
          <p className={styles.statNumber} style={{ color: "#4ade80" }}>{activeCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Vendidos</h3>
          <p className={styles.statNumber}>{soldCount}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Usuarios Registrados</h3>
          <p className={styles.statNumber}>{totalUsersCount}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginTop: "3rem" }}>
        {/* Tabla de Vehículos Pendientes */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className="serif-title">Aprobaciones Pendientes</h2>
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
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No hay publicaciones pendientes de aprobación.</td>
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
                            <div>
                              <strong style={{ color: '#fff' }}>{v.brandName} {v.modelName} {v.version}</strong>
                              <br/><span className={styles.textSmall}>{v.city}</span>
                            </div>
                          </div>
                        </td>
                        <td>{v.userName} {v.userLastName}</td>
                        <td style={{ color: 'var(--gold-accent)' }}>{formattedPrice}</td>
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

        {/* Usuarios Recientes */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className="serif-title">Usuarios Recientes</h2>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No hay usuarios recientes.</td>
                  </tr>
                ) : (
                  recentUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: '#fff' }}>{u.name} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          backgroundColor: u.role === 'ADMIN' ? 'rgba(245,198,11,0.2)' : '#111',
                          color: u.role === 'ADMIN' ? 'var(--gold-accent)' : '#aaa'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <form action={deleteUser.bind(null, u.id)}>
                          <button type="submit" style={{ padding: "0.4rem 0.75rem", background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Eliminar</button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
