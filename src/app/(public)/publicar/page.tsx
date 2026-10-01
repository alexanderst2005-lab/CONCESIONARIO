"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

export default function PublicarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    categoryName: "",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 15) {
        alert("Máximo 15 imágenes permitidas.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.secure_url) {
          uploadedUrls.push(result.secure_url);
        }
      } catch (err) {
        console.error("Error al subir imagen:", err);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload images first
      const uploadedImageUrls = await uploadImagesToCloudinary();

      const formattedData = {
        ...formData,
        year: parseInt(formData.year) || 0,
        mileage: parseInt(formData.mileage) || 0,
        engineCapacity: parseInt(formData.engineCapacity) || 0,
        price: parseInt(formData.price) || 0,
        images: uploadedImageUrls // <--- Attach URLs to the JSON body
      };

      // 2. Submit data to API
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
                <label>Tipo de Vehículo</label>
                <select name="categoryName" value={formData.categoryName} onChange={handleInputChange} required>
                  <option value="" disabled>Selecciona un tipo</option>
                  <option value="Automóviles">Automóviles</option>
                  <option value="SUV">SUV</option>
                  <option value="Camionetas">Camionetas</option>
                  <option value="Motos">Motos</option>
                  <option value="Comerciales">Comerciales</option>
                </select>
              </div>
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
                <input type="text" name="modelName" value={formData.modelName} onChange={handleInputChange} placeholder="Ej: CX-5" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Versión</label>
                <input type="text" name="version" value={formData.version} onChange={handleInputChange} placeholder="Ej: Grand Touring LX" required />
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
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleImageChange}
            />

            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Haz clic aquí para seleccionar imágenes. Máximo 15.</p>
              <button type="button" className="btn-secondary" style={{ backgroundColor: "var(--interaction-color)", borderColor: "var(--interaction-color)", color: "#fff", marginTop: "10px" }}>
                Seleccionarlas
              </button>
            </div>

            {previewUrls.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" }}>
                    <img src={url} alt={`preview-${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                      style={{ position: "absolute", top: "5px", right: "5px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.sectionBlock}>
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

          <div className={styles.controls}>
            <button 
              type="submit" 
              className={`btn-primary ${styles.submitBtnLarge}`} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "SUBIENDO FOTOS Y PUBLICANDO..." : "PUBLICAR VEHÍCULO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
