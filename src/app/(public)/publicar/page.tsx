"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUI } from "@/components/UIProvider";
import styles from "./page.module.css";

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

export default function PublicarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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
    color: "",
    soat: "true",
    tecnomecanica: "true",
    ownersCount: "1",
    prenda: "false",
    accessories: "",
    hasGas: "false",
    hasGps: "false",
    locationStatus: "Vitrina",
    cityRegistered: "",
    contactPhone: "",
  });

  // Prellenar con el teléfono del perfil si el usuario ya lo tiene
  React.useEffect(() => {
    const profilePhone = (session?.user as any)?.phone;
    if (profilePhone) {
      setFormData((prev) => (prev.contactPhone ? prev : { ...prev, contactPhone: profilePhone }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      // If changing category, reset the brand
      if (name === "categoryName") {
        nextData.brandName = "";
      }
      return nextData;
    });
  };

  const { toast } = useUI();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 15) {
        toast("Máximo 15 imágenes permitidas.", "warning");
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
    if (formData.contactPhone.replace(/\D/g, "").length < 10) {
      toast("Ingresa un número de WhatsApp válido (mínimo 10 dígitos).", "warning");
      return;
    }
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
        if (isAdmin) {
          toast("Vehículo publicado exitosamente y ya está ACTIVO.", "success");
          router.push("/admin/vehiculos");
        } else {
          toast("Vehículo publicado exitosamente. Quedará en estado PENDIENTE hasta su aprobación.", "success");
          router.push("/mi-cuenta");
        }
      } else {
        const errorData = await res.json();
        toast(`Error al publicar: ${errorData.message}`, "error");
      }
    } catch (err) {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamically filter brands based on selected category
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
    
    // If the category has NO brands linked, maybe just show all or show nothing?
    // According to filter logic: it strictly filters. So if empty array, it shows 0 brands.
    const lowercaseParsed = parsedBrands.map(b => b.toLowerCase().trim());
    return dbBrands.filter(b => lowercaseParsed.includes(b.name.toLowerCase().trim()));
  }, [formData.categoryName, dbCategories, dbBrands]);

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
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h2>Documentación y Precio</h2>
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
                <label>WhatsApp de contacto *</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="Ej: 300 123 4567" required />
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
