import React from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function MiCuentaPage() {
  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>JD</div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>Juan David</p>
            <p className={styles.userRole}>Vendedor Regular</p>
          </div>
        </div>
        
        <nav className={styles.navMenu}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>Mis Vehículos</a>
          <a href="#" className={styles.navItem}>Favoritos</a>
          <a href="#" className={styles.navItem}>Mi Perfil</a>
          <a href="#" className={styles.navItem}>Configuración</a>
          <a href="#" className={`${styles.navItem} ${styles.logout}`}>Cerrar Sesión</a>
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
            <p className={styles.statNumber}>2</p>
          </div>
          <div className={styles.statCard}>
            <h3>En revisión</h3>
            <p className={styles.statNumber}>1</p>
          </div>
          <div className={styles.statCard}>
            <h3>Vendidos</h3>
            <p className={styles.statNumber}>4</p>
          </div>
        </div>

        <div className={styles.vehicleList}>
          {/* Vehículo Dummy 1 */}
          <div className={styles.vehicleListItem}>
            <div className={styles.listImagePlaceholder}>Auto</div>
            <div className={styles.listInfo}>
              <h4>Mazda CX-5 Grand Touring</h4>
              <p>2022 • 35,000 km • Bogotá</p>
              <span className={`${styles.badge} ${styles.badgeActive}`}>Activo</span>
            </div>
            <div className={styles.listPrice}>
              <p>$ 125.000.000</p>
            </div>
            <div className={styles.listActions}>
              <button className="btn-secondary">Editar</button>
              <button className="btn-secondary">Pausar</button>
            </div>
          </div>

          {/* Vehículo Dummy 2 */}
          <div className={styles.vehicleListItem}>
            <div className={styles.listImagePlaceholder}>Auto</div>
            <div className={styles.listInfo}>
              <h4>Chevrolet Tracker RS</h4>
              <p>2024 • 1,500 km • Medellín</p>
              <span className={`${styles.badge} ${styles.badgePending}`}>En Revisión</span>
            </div>
            <div className={styles.listPrice}>
              <p>$ 110.000.000</p>
            </div>
            <div className={styles.listActions}>
              <button className="btn-secondary" disabled>Editando...</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
