const fs = require('fs');

let code = fs.readFileSync('src/app/(public)/vehiculo/[slug]/page.tsx', 'utf8');

const replacement = `<h2 className={styles.sectionTitle}>Características</h2>

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
            <span className={styles.specValue}>{vehicle.engineCapacity ? \`\${vehicle.engineCapacity} cc\` : '-'}</span>
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
            <span className={styles.specValue}>{vehicle.plate ? (vehicle.plate.length > 1 ? \`*** *** \${vehicle.plate.charAt(vehicle.plate.length - 1)}\` : vehicle.plate) : '-'}</span>
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

        <h2 className={styles.sectionTitle} style={{marginTop: '2rem'}}>Descripción</h2>`;

const regex = /<h2 className={styles\.sectionTitle}>Características<\/h2>[\s\S]*?<h2 className={styles\.sectionTitle} style={{marginTop: '2rem'}}>Descripción<\/h2>/;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/(public)/vehiculo/[slug]/page.tsx', code);
