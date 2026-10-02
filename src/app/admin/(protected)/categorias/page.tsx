"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUI } from "@/components/UIProvider";

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [globalBrands, setGlobalBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use array of brand names for form + imageUrl
  const [form, setForm] = useState<{ name: string, isActive: boolean, subtypes: string, brandsInput: string, imageUrl: string }>({ 
    name: "", isActive: true, subtypes: "", brandsInput: "", imageUrl: "" 
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  const fetchBrands = async () => {
    const res = await fetch("/api/brands");
    if (res.ok) {
      const data = await res.json();
      setGlobalBrands(data);
    }
  };

  useEffect(() => { 
    fetchCategories(); 
    fetchBrands();
  }, []);

  const { toast, confirmAction } = useUI();

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("folder", "category_images");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      if (result.secure_url) {
        setForm(prev => ({ ...prev, imageUrl: result.secure_url }));
        setImagePreview(result.secure_url);
      } else {
        toast("Error al subir la imagen. Intente de nuevo.", "error");
      }
    } catch {
      toast("Error de conexión al subir la imagen.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const subtypesArray = form.subtypes 
      ? form.subtypes.split(',').map(s => s.trim()).filter(s => s) 
      : [];
      
    const brandsArray = form.brandsInput
      ? form.brandsInput.split(',').map(s => s.trim()).filter(s => s)
      : [];
      
    const payload = { 
      name: form.name,
      isActive: form.isActive,
      subtypes: JSON.stringify(subtypesArray),
      brandsList: JSON.stringify(brandsArray),
      imageUrl: form.imageUrl
    };

    if (editingId) {
      await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      toast("Tipo de vehículo actualizado", "success");
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast("Tipo de vehículo agregado", "success");
    }
    setForm({ name: "", isActive: true, subtypes: "", brandsInput: "", imageUrl: "" });
    setImagePreview(null);
    setEditingId(null);
    fetchCategories();
  };

  const handleDeactivate = async (id: number) => {
    confirmAction("¿Desactivar esta categoría?", async () => {
      await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      toast("Categoría desactivada", "success");
      fetchCategories();
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem", background: "#050505", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px", color: "#fff", outline: "none",
  };

  const currentImageDisplay = imagePreview || form.imageUrl;

  return (
    <div>
      <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff", marginBottom: "2rem" }}>Tipos de Vehículo</h1>

      <form onSubmit={handleSubmit} style={{ background: "#080808", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>NOMBRE DEL TIPO</label>
            <input type="text" style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ej: Camiones" />
          </div>
          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>SUBTIPOS (Separados por coma)</label>
            <input type="text" style={inputStyle} value={form.subtypes} onChange={e => setForm(p => ({ ...p, subtypes: e.target.value }))} placeholder="Ej: Furgón, Estacas" />
          </div>

          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>FOTO DEL TIPO DE VEHÍCULO</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFileChange}
            />
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100px", height: "70px", background: "#050505",
                  border: currentImageDisplay ? "1px solid rgba(245,198,11,0.4)" : "1px dashed rgba(255,255,255,0.2)",
                  borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden"
                }}
              >
                {uploadingImage ? (
                  <span style={{ color: "#f5c60b", fontSize: "0.7rem" }}>Subiendo...</span>
                ) : currentImageDisplay ? (
                  <img src={currentImageDisplay} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#555", fontSize: "0.75rem" }}>Subir Foto</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ padding: "0.5rem 1rem", background: "#222", color: "#fff", border: "1px solid #333", borderRadius: "4px", cursor: uploadingImage ? "not-allowed" : "pointer", fontSize: "0.8rem", marginBottom: "0.5rem", display: "block" }}>
                  Seleccionar archivo
                </button>
                {currentImageDisplay && (
                  <button type="button" onClick={() => { setImagePreview(null); setForm(p => ({ ...p, imageUrl: "" })); }} style={{ padding: "0.3rem 0.5rem", background: "transparent", color: "#f87171", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" disabled={uploadingImage} style={{ padding: "0.8rem 2rem", background: "var(--gold-accent)", color: "#000", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: uploadingImage ? "not-allowed" : "pointer" }}>
              {editingId ? "Actualizar" : "Agregar Tipo"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", isActive: true, subtypes: "", brandsInput: "", imageUrl: "" }); setImagePreview(null); }} style={{ padding: "0.8rem 1rem", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer" }}>
                Cancelar
              </button>
            )}
          </div>
        </div>

          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>MARCAS (Separadas por coma)</label>
            <textarea 
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} 
              value={form.brandsInput} 
              onChange={e => setForm(p => ({ ...p, brandsInput: e.target.value }))} 
              placeholder="Ej: Chevrolet, Mazda, Ford" 
            />
          </div>
      </form>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem" }}>
        {loading ? <p style={{ color: "#888" }}>Cargando...</p> : categories.length === 0 ? <p style={{ color: "#888" }}>No hay tipos registrados.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {categories.map(cat => {
              const subtypesStr = (() => {
                try {
                  const arr = JSON.parse(cat.subtypes);
                  return Array.isArray(arr) ? arr.join(', ') : "";
                } catch(e) { return cat.subtypes || ""; }
              })();
              
              let brandsArr: string[] = [];
              try {
                const arr = JSON.parse(cat.brandsList);
                if (Array.isArray(arr)) brandsArr = arr;
              } catch(e) {
                 if (cat.brandsList) brandsArr = cat.brandsList.split(',').map((s:string) => s.trim());
              }
              const brandsStr = brandsArr.join(', ');
              
              return (
              <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", background: "#050505" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {/* Image Display */}
                  <div style={{ width: "80px", height: "60px", background: "#111", borderRadius: "4px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#444", fontSize: "0.7rem" }}>Sin foto</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ color: "#fff", margin: 0 }}>{cat.name}</h3>
                    <p style={{ margin: "0.25rem 0", color: "#888", fontSize: "0.85rem" }}>{subtypesStr ? `Subtipos: ${subtypesStr}` : "Sin subtipos"}</p>
                    <p style={{ margin: "0", color: "#888", fontSize: "0.85rem" }}>{brandsStr ? `Marcas vinculadas: ${brandsStr}` : "Sin marcas vinculadas"}</p>
                    <span style={{ fontSize: "0.8rem", color: cat.isActive ? "#4ade80" : "#f87171" }}>{cat.isActive ? "Activo" : "Inactivo"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => { 
                    setEditingId(cat.id); 
                    setForm({ name: cat.name, isActive: cat.isActive, subtypes: subtypesStr, brandsInput: brandsStr, imageUrl: cat.imageUrl || "" }); 
                    setImagePreview(cat.imageUrl || null);
                  }} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
                  {cat.isActive && <button onClick={() => handleDeactivate(cat.id)} style={{ padding: "0.5rem 1rem", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer" }}>Desactivar</button>}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

