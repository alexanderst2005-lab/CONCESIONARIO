"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

export default function PublicarPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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
          {step === 1 && (
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Información Básica</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Marca</label>
                  <select defaultValue="">
                    <option value="" disabled>Selecciona una marca</option>
                    <option value="mazda">Mazda</option>
                    <option value="toyota">Toyota</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Modelo</label>
                  <select defaultValue="">
                    <option value="" disabled>Selecciona un modelo</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Versión</label>
                  <input type="text" placeholder="Ej: Grand Touring LX" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Año</label>
                  <input type="number" placeholder="Ej: 2024" />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Info Técnica */}
          {step === 2 && (
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Información Técnica</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Kilometraje (km)</label>
                  <input type="number" placeholder="Ej: 45000" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Combustible</label>
                  <select defaultValue="">
                    <option value="" disabled>Selecciona tipo</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diésel</option>
                    <option value="Hibrido">Híbrido</option>
                    <option value="Electrico">Eléctrico</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Transmisión</label>
                  <select defaultValue="">
                    <option value="" disabled>Selecciona tipo</option>
                    <option value="Automatica">Automática</option>
                    <option value="Mecanica">Mecánica</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Cilindraje (cc)</label>
                  <input type="number" placeholder="Ej: 2000" />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Accesorios y Documentación (Simplificado) */}
          {step === 3 && (
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Documentación y Precio</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Precio de Venta (COP)</label>
                  <input type="number" placeholder="Ej: 85000000" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Ciudad donde está ubicado</label>
                  <input type="text" placeholder="Ej: Bogotá" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Placa (No será pública)</label>
                  <input type="text" placeholder="Ej: ABC123" />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Fotografías */}
          {step === 4 && (
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
          )}

          {/* PASO 5: Descripción */}
          {step === 5 && (
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Descripción Adicional</h2>
              <div className={styles.inputGroup}>
                <label>Detalles del vehículo</label>
                <textarea 
                  rows={6} 
                  placeholder="Describe el estado general del vehículo, mantenimientos, único dueño, etc..."
                  className={styles.textarea}
                ></textarea>
              </div>
            </div>
          )}

          {/* PASO 6: Vista Previa */}
          {step === 6 && (
            <div className={`animate-fade-in ${styles.stepContent}`}>
              <h2>Vista Previa</h2>
              <div className={styles.previewBox}>
                <p>Aquí irá un resumen de cómo se verá la publicación antes de enviarla a revisión.</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={prevStep}
              disabled={step === 1}
              style={{ opacity: step === 1 ? 0.5 : 1 }}
            >
              Volver
            </button>
            
            {step < totalSteps ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Siguiente Paso
              </button>
            ) : (
              <button type="button" className="btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}>
                Enviar para Aprobación
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
