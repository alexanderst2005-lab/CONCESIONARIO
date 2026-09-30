"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function PublicarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    brandName: "",
    modelName: "",
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("¡Vehículo enviado con éxito! Un administrador lo revisará pronto.");
        router.push("/mi-cuenta");
      } else {
        alert("Ocurrió un error al guardar el vehículo.");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`container ${styles.publishContainer}`}>
      <div className={styles.header}>
        <h1 className="section-title">Publicar Vehículo</h1>
        <p className={styles.subtitle}>Completa la información para que los compradores puedan encontrar tu vehículo.</p>
        
        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className={styles.stepIndicator}>Paso {step} de {totalSteps}</p>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={(e) => e.preventDefault()}>
          
          {/* PASO 1: Info Básica */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Información Básica</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Marca</label>
                  <select name="brandName" value={formData.brandName} onChange={handleInputChange}>
                    <option value="" disabled>Selecciona una marca</option>
                    <option value="Audi">Audi</option>
                    <option value="BMW">BMW</option>
                    <option value="BYD">BYD</option>
                    <option value="Changan">Changan</option>
                    <option value="Chery">Chery</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Citroen">Citroen</option>
                    <option value="Dodge">Dodge</option>
                    <option value="Fiat">Fiat</option>
                    <option value="Ford">Ford</option>
                    <option value="Honda">Honda</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="JAC">JAC</option>
                    <option value="Jeep">Jeep</option>
                    <option value="Kia">Kia</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="MG">MG</option>
                    <option value="MINI">MINI</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Peugeot">Peugeot</option>
                    <option value="Porsche">Porsche</option>
                    <option value="RAM">RAM</option>
                    <option value="Renault">Renault</option>
                    <option value="Seat">Seat</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Volvo">Volvo</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Modelo (Ej: CX-5)</label>
                  <input type="text" name="modelName" value={formData.modelName} onChange={handleInputChange} placeholder="Ej: CX-5" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Versión</label>
                  <input type="text" name="version" value={formData.version} onChange={handleInputChange} placeholder="Ej: Grand Touring LX" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Año</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="Ej: 2024" />
                </div>
              </div>
            </div>

          {/* PASO 2: Info Técnica */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Información Técnica</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Kilometraje (km)</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="Ej: 45000" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Combustible</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                    <option value="" disabled>Selecciona tipo</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Transmisión</label>
                  <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                    <option value="" disabled>Selecciona tipo</option>
                    <option value="Automática">Automática</option>
                    <option value="Mecánica">Mecánica</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Cilindraje (cc)</label>
                  <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="Ej: 2000" />
                </div>
              </div>
            </div>

          {/* PASO 3: Documentación y Precio */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Documentación y Precio</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Precio de Venta (COP)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ej: 85000000" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Ciudad donde está ubicado</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ej: Bogotá" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Placa (No será pública)</label>
                  <input type="text" name="plate" value={formData.plate} onChange={handleInputChange} placeholder="Ej: ABC123" />
                </div>
              </div>
            </div>

          {/* PASO 4: Fotografías */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Fotografías</h2>
              <p className={styles.helpText}>Sube al menos 3 fotos de buena calidad. La primera será la imagen principal.</p>
              
              <div className={styles.uploadArea}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Arrastra tus fotos aquí o haz clic para seleccionar</p>
                <button type="button" className="btn-secondary">Seleccionar archivos</button>
              </div>
            </div>

          {/* PASO 5: Descripción */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Descripción Adicional</h2>
              <div className={styles.inputGroup}>
                <label>Detalles del vehículo</label>
                <textarea 
                  rows={6} 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el estado general del vehículo, mantenimientos, único dueño, etc..."
                  className={styles.textarea}
                ></textarea>
              </div>
            </div>

          {/* PASO 6: Vista Previa */}
          
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Vista Previa y Confirmación</h2>
              <div className={styles.previewBox}>
                <h3>{formData.brandName} {formData.modelName} {formData.version} - {formData.year}</h3>
                <p><strong>Precio:</strong> $ {parseInt(formData.price || "0").toLocaleString()}</p>
                <p><strong>Ciudad:</strong> {formData.city}</p>
                <p><strong>Recorrido:</strong> {formData.mileage} km</p>
                <p style={{ marginTop: "1rem" }}><em>Tu vehículo entrará en estado PENDIENTE hasta que un administrador lo apruebe.</em></p>
              </div>
            </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              style={{ opacity: step === 1 ? 0.5 : 1 }}
            >
              Volver
            </button>
            
            {step < totalSteps ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Siguiente Paso
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary" 
                style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar para Aprobación"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
