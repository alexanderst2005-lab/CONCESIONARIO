"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/(public)/publicar/page.module.css";
import { useUI } from "@/components/UIProvider";

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

export default function EditVehicleForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialData.existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbBrands, setDbBrands] = useState<{id: number, name: string}[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  
  React.useEffect(() => {
    Promise.all([
      fetch('/api/brands').then(res => res.json()),
      fetch('/api/admin/categories').then(res => res.json())
    ]).then(([brandsData, catsData]) => {
      if (Array.isArray(brandsData)) setDbBrands(brandsData);
      if (Array.isArray(catsData)) setDbCategories(catsData);
    }).catch(e => console.error(e));
  }, []);

  const [formData, setFormData] = useState({
    id: initialData.id,
    categoryName: initialData.categoryName || "",
    brandName: initialData.brandName,
    modelName: initialData.modelName,
    version: initialData.version,
    year: initialData.year,
    mileage: initialData.mileage,
    fuelType: initialData.fuelType,
    transmission: initialData.transmission,
    engineCapacity: initialData.engineCapacity,
    price: initialData.price,
    city: initialData.city,
    plate: initialData.plate,
    description: initialData.description,
    color: initialData.color,
    soat: initialData.soat,
    tecnomecanica: initialData.tecnomecanica,
    prenda: initialData.prenda,
    ownersCount: initialData.ownersCount,
    contactPhone: initialData.contactPhone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const actualName = name === "vehicleYear" ? "year" : name;
    setFormData((prev) => ({ ...prev, [actualName]: value }));
  };

  const { toast } = useUI();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (previewUrls.length + selectedFiles.length > 15) {
        toast("Máximo 15 imágenes permitidas.", "warning");
        return;
      }
      setNewImages((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // If it's an existing image, it's just a URL string. 
    // If it's a new image, we need to remove it from newImages too.
    const isExisting = index < (previewUrls.length - newImages.length);
    if (!isExisting) {
      const newImageIndex = index - (previewUrls.length - newImages.length);
      setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedUrls: string[] = [];
    for (const file of newImages) {
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
      const uploadedNewImageUrls = await uploadImagesToCloudinary();
      
      // Combine existing URLs that weren't removed + new uploaded URLs
      const existingUrlsRetained = previewUrls.filter(url => url.startsWith("http"));
      const finalImageUrls = [...existingUrlsRetained, ...uploadedNewImageUrls];

      const formattedData = {
        ...formData,
        year: parseInt(formData.year) || 0,
        mileage: parseInt(formData.mileage) || 0,
        engineCapacity: parseInt(formData.engineCapacity) || 0,
        price: parseInt(formData.price) || 0,
        ownersCount: parseInt(formData.ownersCount) || 1,
        images: finalImageUrls
      };

      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        toast("Vehículo actualizado exitosamente.", "success");
        router.push("/mi-cuenta");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast(`Error al actualizar: ${errorData.message}`, "error");
      }
    } catch (err) {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allowedBrands = React.useMemo(() => {
    if (!formData.categoryName || dbCategories.length === 0) return dbBrands;
    const cat = dbCategories.find(c => c.name === formData.categoryName);
    if (!cat || !cat.brandsList) return dbBrands;
    
    let parsedBrands: string[] = [];
    try {
      const parsed = JSON.parse(cat.brandsList);
      if (Array.isArray(parsed)) parsedBrands = parsed;
    } catch(e) {
      if (typeof cat.brandsList === 'string' && cat.brandsList.trim() !== '') {
        parsedBrands = cat.brandsList.split(',').map((s: string) => s.trim());
      }
    }
    
    const lowercaseParsed = parsedBrands.map(b => b.toLowerCase().trim());
    return dbBrands.filter(b => lowercaseParsed.includes(b.name.toLowerCase().trim()));
  }, [formData.categoryName, dbCategories, dbBrands]);

  return (
    <div className={styles.publishContainer}>
      <div className={styles.header}>
        <h1 className="serif-title">Editar Vehículo</h1>
        <p className={styles.subtitle}>Actualiza la información de tu publicación.</p>
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
                  {dbCategories.length > 0 ? (
                    dbCategories.filter(c => c.isActive).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Automóviles">Automóviles</option>
                      <option value="SUV">SUV</option>
                      <option value="Camionetas">Camionetas</option>
                      <option value="Motos">Motos</option>
                      <option value="Comerciales">Comerciales</option>
                    </>
                  )}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Marca</label>
                <select name="brandName" value={formData.brandName} onChange={handleInputChange} required disabled={!formData.categoryName}>
                  <option value="" disabled>Selecciona una marca</option>
                  {allowedBrands.length > 0 ? (
                    allowedBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>No hay marcas asociadas</option>
                  )}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Modelo (Ej: CX-5)</label>
                <input type="text" name="modelName" value={formData.modelName} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Versión</label>
                <input type="text" name="version" value={formData.version} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Año</label>
                <input type="number" name="vehicleYear" value={formData.year} onChange={handleInputChange} required autoComplete="off" />
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Información Técnica</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Kilometraje (km)</label>
                <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} required />
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
                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="Ej: Negro Metálico" />
              </div>
              <div className={styles.inputGroup}>
                <label>Número de dueños</label>
                <input type="number" name="ownersCount" value={formData.ownersCount} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Documentación y Precio</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Precio de Venta (COP)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Ciudad donde está ubicado</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>WhatsApp de contacto *</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="Ej: 300 123 4567" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Placa</label>
                <input type="text" name="plate" value={formData.plate} onChange={handleInputChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>SOAT (Vencimiento)</label>
                <input type="text" name="soat" value={formData.soat} onChange={handleInputChange} placeholder="Ej: Octubre 2024" />
              </div>
              <div className={styles.inputGroup}>
                <label>Tecnomecánica (Vencimiento)</label>
                <input type="text" name="tecnomecanica" value={formData.tecnomecanica} onChange={handleInputChange} placeholder="Ej: Octubre 2024" />
              </div>
              <div className={styles.inputGroup}>
                <label>Prenda / Deuda</label>
                <select name="prenda" value={formData.prenda} onChange={handleInputChange}>
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Fotografías</h2>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleImageChange}
            />

            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <p>Haz clic aquí para añadir imágenes.</p>
              <button type="button" className="btn-secondary" style={{ backgroundColor: "var(--interaction-color)", borderColor: "var(--interaction-color)", color: "#fff", marginTop: "10px" }}>
                Seleccionarlas
              </button>
            </div>

            {previewUrls.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative", width: "100px", height: "100px" }}>
                    <img src={url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
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
              <textarea 
                rows={6} 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
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
              {isSubmitting ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
