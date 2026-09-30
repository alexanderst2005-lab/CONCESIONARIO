import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.heroTitle}>Encuentra el vehículo que estás buscando</h1>
          <p className={styles.heroSubtitle}>Compra, vende y publica vehículos de forma fácil, rápida y segura.</p>
          
          {/* Main Search Component */}
          <div className={styles.searchBox}>
            <form className={styles.searchForm}>
              <div className={styles.searchGrid}>
                <div className={styles.inputGroup}>
                  <label>Categoría</label>
                  <select>
                    <option value="">Todas</option>
                    <option value="carros">Carros y camionetas</option>
                    <option value="motos">Motos</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Marca</label>
                  <select>
                    <option value="">Todas</option>
                    <option value="toyota">Toyota</option>
                    <option value="mazda">Mazda</option>
                    <option value="chevrolet">Chevrolet</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Modelo</label>
                  <select>
                    <option value="">Todos</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Ciudad</label>
                  <select>
                    <option value="">Cualquiera</option>
                    <option value="bogota">Bogotá</option>
                    <option value="medellin">Medellín</option>
                    <option value="cali">Cali</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Precio Máximo</label>
                  <select>
                    <option value="">Sin límite</option>
                    <option value="50000000">Hasta $50M</option>
                    <option value="100000000">Hasta $100M</option>
                  </select>
                </div>
                <div className={styles.searchButtonWrapper}>
                  <button type="submit" className={`btn-primary ${styles.searchBtn}`}>
                    Buscar vehículos
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={`container ${styles.categoriesSection}`}>
        <h2 className="section-title">Explora por categoría</h2>
        <div className={styles.categoryGrid}>
          {['Carros y camionetas', 'Motos', 'Camiones', 'Vehículos comerciales', 'Otros'].map((cat) => (
            <div key={cat} className={styles.categoryCard}>
              <h3>{cat}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
