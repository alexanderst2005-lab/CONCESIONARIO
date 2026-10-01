"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function PublicarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...formData,
        year: parseInt(formData.year) || 0,
        mileage: parseInt(formData.mileage) || 0,
        engineCapacity: parseInt(formData.engineCapacity) || 0,
        price: parseInt(formData.price) || 0,
      };

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        alert("Vehículo publicado exitosamente. Quedará en estado PENDIENTE hasta su aprobación.");
        router.push("/mi-cuenta");
      } else {
        const errorData = await res.json();
        alert(`Error al publicar: ${errorData.message}`);
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.publishContainer}>
      <div className={styles.header}>
        <h1 className="serif-title">Publicar Vehículo</h1>
        <p className={styles.subtitle}>Completa la información para que los compradores puedan encontrar tu vehículo.</p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          
          <div className={styles.sectionBlock}>
            <h2>Información Básica</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Marca</label>
                <select name="brandName" value={formData.brandName} onChange={handleInputChange} required>
                  <option value="" disabled>Selecciona una marca</option>
                  <option value="Audi">Audi</option>
                  <option value="BMW">BMW</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Ford">Ford</option>
                  <option value="Honda">Honda</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Kia">Kia</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Volkswagen">Volkswagen</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Modelo (Ej: CX-5)</label>
                <input type="text" name="modelName" value={formData.modelName} onChange={handleInputChange} placeholder="Ej: CX-5" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Versión</label>
                <input type="text" name="version" value={formData.version} onChange={handleInputChange} placeholder="Ej: Grand Touring" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Año</label>
                <input type="number" name="year" value={formData.year} onChange={handleInputChange} placeholder="Ej: 2024" required />
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Información Técnica</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Kilometraje (km)</label>
                <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="Ej: 45000" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Combustible</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} required>
                  <option value="" disabled>Selecciona tipo</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Transmisión</label>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange} required>
                  <option value="" disabled>Selecciona tipo</option>
                  <option value="Automática">Automática</option>
                  <option value="Mecánica">Mecánica</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Cilindraje (cc)</label>
                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="Ej: 2000" required />
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Documentación y Precio</h2>
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
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Fotografías</h2>
            <p className={styles.helpText}>Agrega una o más fotos (mínimo 5 en el orden que desees que se muestren en la plataforma)</p>
            
            <div className={styles.uploadArea}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Arrastra aquí las imágenes que quieres cargar. Máximo 15.</p>
              <button type="button" className="btn-secondary" style={{ backgroundColor: "var(--gold-accent)", borderColor: "var(--gold-accent)", color: "#000", marginTop: "10px", fontWeight: "600" }}>
                Seleccionarlas
              </button>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Descripción Adicional</h2>
            <div className={styles.inputGroup}>
              <label>Detalles del vehículo</label>
              <textarea rows={4} name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} required></textarea>
            </div>
          </div>

          <div className={styles.controls}>
            <button type="submit" className={`btn-primary ${styles.submitBtnLarge}`} disabled={isSubmitting} style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem" }}>
              {isSubmitting ? "ENVIANDO..." : "PUBLICAR VEHÍCULO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
