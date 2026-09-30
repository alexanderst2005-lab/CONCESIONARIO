import React from "react";
import styles from "./page.module.css";

export default function AdminDashboardPage() {
  return (
    <div className={`container ${styles.adminContainer}`}>
      {/* Barra Lateral Admin */}
      <aside className={styles.sidebar}>
        <div className={styles.adminHeader}>
          <div className={styles.logoAccent}>Panel Admin</div>
          <p className={styles.adminRole}>Super Administrador</p>
        </div>
        
        <nav className={styles.navMenu}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>Dashboard</a>
          <a href="#" className={styles.navItem}>Vehículos</a>
          <a href="#" className={styles.navItem}>Usuarios</a>
          <a href="#" className={styles.navItem}>Leads / Interesados</a>
          <a href="#" className={styles.navItem}>Marcas y Modelos</a>
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
            <p className={styles.statNumber}>1,245</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pendientes de Aprobación</h3>
            <p className={styles.statNumber}>12</p>
          </div>
          <div className={styles.statCard}>
            <h3>Usuarios Activos</h3>
            <p className={styles.statNumber}>3,450</p>
          </div>
          <div className={styles.statCard}>
            <h3>Leads Generados</h3>
            <p className={styles.statNumber}>450</p>
          </div>
        </div>

        {/* Tabla de Vehículos Pendientes */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>Vehículos Pendientes de Aprobación</h2>
            <button className="btn-secondary">Ver Todos</button>
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
                {/* Fila 1 */}
                <tr>
                  <td>
                    <div className={styles.tdVehicle}>
                      <div className={styles.miniImg}></div>
                      <div>
                        <strong>Toyota Hilux 2024</strong>
                        <br/><span className={styles.textSmall}>Bogotá</span>
                      </div>
                    </div>
                  </td>
                  <td>Carlos Pérez</td>
                  <td>$ 210.000.000</td>
                  <td>Hoy, 10:30 AM</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnApprove}>Aprobar</button>
                      <button className={styles.btnReject}>Rechazar</button>
                    </div>
                  </td>
                </tr>
                {/* Fila 2 */}
                <tr>
                  <td>
                    <div className={styles.tdVehicle}>
                      <div className={styles.miniImg}></div>
                      <div>
                        <strong>Renault Duster 2021</strong>
                        <br/><span className={styles.textSmall}>Medellín</span>
                      </div>
                    </div>
                  </td>
                  <td>María Gómez</td>
                  <td>$ 65.000.000</td>
                  <td>Ayer, 4:15 PM</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnApprove}>Aprobar</button>
                      <button className={styles.btnReject}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
