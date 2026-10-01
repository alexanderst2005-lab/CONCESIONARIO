const fs = require('fs');
let code = fs.readFileSync('src/app/(public)/publicar/page.tsx', 'utf8');

// 1. Update formData initial state
const initialStateOld = `    modelName: "",
    version: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    engineCapacity: "",
    price: "",
    city: "",
    plate: "",
    description: "",`;

const initialStateNew = `    modelName: "",
    version: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    engineCapacity: "",
    price: "",
    city: "",
    plate: "",
    description: "",
    color: "",
    soat: "true",
    tecnomecanica: "true",
    ownersCount: "1",
    prenda: "false",
    accessories: "",
    hasGas: "false",
    hasGps: "false",
    locationStatus: "Vitrina",
    cityRegistered: "",`;

code = code.replace(initialStateOld, initialStateNew);


// 2. Add new inputs to the Technical Info Section Block
const techInfoBlockOld = `<div className={styles.inputGroup}>
                <label>Cilindraje (cc)</label>
                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="Ej: 2000" required />
              </div>
            </div>`;

const techInfoBlockNew = `<div className={styles.inputGroup}>
                <label>Cilindraje (cc)</label>
                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="Ej: 2000" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="Ej: Blanco Perla" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Si tuvo Gas</label>
                <select name="hasGas" value={formData.hasGas} onChange={handleInputChange}>
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Si tiene GPS</label>
                <select name="hasGps" value={formData.hasGps} onChange={handleInputChange}>
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Accesorios adicionales</label>
                <textarea name="accessories" value={formData.accessories} onChange={handleInputChange} placeholder="Ej: Cojinería en cuero, aire acondicionado, vidrios eléctricos" style={{width: '100%', padding: '0.75rem', backgroundColor: '#050505', border: '1px solid #333', borderRadius: '4px', color: '#fff'}} />
              </div>
            </div>`;

code = code.replace(techInfoBlockOld, techInfoBlockNew);


// 3. Add documentation inputs
const docBlockOld = `<h2>Documentación y Precio</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Precio de Venta (COP)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ej: 85000000" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Ciudad donde está ubicado</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ej: Bogotá" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Placa (No será pública)</label>
                <input type="text" name="plate" value={formData.plate} onChange={handleInputChange} placeholder="Ej: ABC123" required />
              </div>
            </div>`;

const docBlockNew = `<h2>Documentación y Precio</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Precio Comercial (COP)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ej: 85000000" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Matriculado en (Ciudad)</label>
                <input type="text" name="cityRegistered" value={formData.cityRegistered} onChange={handleInputChange} placeholder="Ej: Bogotá" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Placa</label>
                <input type="text" name="plate" value={formData.plate} onChange={handleInputChange} placeholder="Ej: ABC123" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Ubicación Física</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ciudad (Ej: Cali)" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Soat Vigente</label>
                <select name="soat" value={formData.soat} onChange={handleInputChange}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Tecnomecánica Vigente</label>
                <select name="tecnomecanica" value={formData.tecnomecanica} onChange={handleInputChange}>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Número de Dueños</label>
                <input type="number" name="ownersCount" value={formData.ownersCount} onChange={handleInputChange} min="1" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Prenda</label>
                <select name="prenda" value={formData.prenda} onChange={handleInputChange}>
                  <option value="false">No (Libre)</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Cita o Vitrina</label>
                <select name="locationStatus" value={formData.locationStatus} onChange={handleInputChange}>
                  <option value="Cita">Con Cita</option>
                  <option value="Vitrina">En Vitrina</option>
                </select>
              </div>
            </div>`;

code = code.replace(docBlockOld, docBlockNew);

fs.writeFileSync('src/app/(public)/publicar/page.tsx', code);
