"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUI } from "@/components/UIProvider";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBrands = async () => {
    setLoading(true);
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setUploadingLogo(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("folder", "brand_logos");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      if (result.secure_url) {
        setForm(prev => ({ ...prev, logoUrl: result.secure_url }));
        setLogoPreview(result.secure_url);
        setMessage("✓ Logo subido correctamente a Cloudinary.");
      } else {
        setMessage("Error al subir el logo. Intente de nuevo.");
      }
    } catch {
      setMessage("Error de conexión al subir el logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editingId) {
        await fetch("/api/brands", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        setMessage("✓ Marca actualizada correctamente.");
      } else {
        await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setMessage("✓ Marca creada correctamente.");
      }
      setForm({ name: "", logoUrl: "", sortOrder: 0 });
      setLogoPreview(null);
      setEditingId(null);
      fetchBrands();
    } catch {
      setMessage("Error al guardar la marca.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setForm({ name: brand.name, logoUrl: brand.logoUrl || "", sortOrder: brand.sortOrder });
    setLogoPreview(brand.logoUrl || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { confirmAction } = useUI();

  const handleDeactivate = async (id: number) => {
    confirmAction("¿Desactivar esta marca?", async () => {
      await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      fetchBrands();
    });
  };

  const handleActivate = async (id: number) => {
    await fetch("/api/brands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    fetchBrands();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", logoUrl: "", sortOrder: 0 });
    setLogoPreview(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "#050505",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.5rem",
  };

  const currentLogoDisplay = logoPreview || form.logoUrl;

  return (
    <div style={{ padding: "2rem 0" }}>
      <h2 style={{ color: "#fff", fontSize: "1.75rem", marginBottom: "2rem", fontWeight: 400 }}>
        {editingId ? "Editar Marca" : "Agregar Marca"}
      </h2>

      {message && (
        <div style={{
          padding: "1rem", background: "#0a0a0a",
          border: `1px solid ${message.startsWith("✓") ? "rgba(37,211,102,0.3)" : "rgba(255,80,80,0.3)"}`,
          borderRadius: "6px",
          color: message.startsWith("✓") ? "#25d366" : "#ff5050",
          marginBottom: "2rem", fontSize: "0.9rem"
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: "#0a0a0a", padding: "2rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Nombre de la Marca *</label>
            <input
              type="text"
              style={inputStyle}
              placeholder="Ej: Mazda"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Orden de aparición</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ej: 1"
              value={form.sortOrder}
              onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* LOGO UPLOAD — Primary Option */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Logo de la Marca</label>
          
          {/* Upload from file — main option */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleLogoFileChange}
          />
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Preview box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "120px",
                height: "80px",
                background: "#050505",
                border: currentLogoDisplay ? "1px solid rgba(245,198,11,0.4)" : "2px dashed rgba(255,255,255,0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
                transition: "border-color 0.2s",
              }}
            >
              {uploadingLogo ? (
                <span style={{ color: "#f5c60b", fontSize: "0.75rem", textAlign: "center", padding: "0.5rem" }}>Subiendo...</span>
              ) : currentLogoDisplay ? (
                <img
                  src={currentLogoDisplay}
                  alt="logo preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
                  onError={e => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#555" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p style={{ fontSize: "0.65rem", marginTop: "4px" }}>Subir logo</p>
                </div>
              )}
            </div>

            {/* Buttons & URL fallback */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: uploadingLogo ? "#222" : "#f5c60b",
                  color: "#000",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "6px",
                  cursor: uploadingLogo ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  alignSelf: "flex-start",
                }}
              >
                {uploadingLogo ? "Subiendo..." : currentLogoDisplay ? "Cambiar Logo" : "Seleccionar Imagen"}
              </button>

              {currentLogoDisplay && (
                <button
                  type="button"
                  onClick={() => { setLogoPreview(null); setForm(p => ({ ...p, logoUrl: "" })); }}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    color: "#888",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    alignSelf: "flex-start",
                  }}
                >
                  Eliminar logo
                </button>
              )}

              {/* URL fallback — secondary option */}
              <div>
                <label style={{ ...labelStyle, fontSize: "0.7rem", color: "#555", marginBottom: "0.25rem" }}>
                  O pega una URL directamente
                </label>
                <input
                  type="text"
                  style={{ ...inputStyle, fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                  placeholder="https://..."
                  value={form.logoUrl}
                  onChange={e => {
                    setForm(p => ({ ...p, logoUrl: e.target.value }));
                    setLogoPreview(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
          <button type="submit" disabled={saving || uploadingLogo} style={{ padding: "0.875rem 2rem", background: "#f5c60b", color: "#000", fontWeight: 700, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.95rem" }}>
            {saving ? "Guardando..." : editingId ? "Actualizar Marca" : "Guardar Marca"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} style={{ padding: "0.875rem 2rem", background: "transparent", color: "#aaa", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer" }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2 style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "1.5rem", fontWeight: 400 }}>Marcas ({brands.length})</h2>

      {loading ? (
        <p style={{ color: "#666" }}>Cargando marcas...</p>
      ) : brands.length === 0 ? (
        <p style={{ color: "#666", padding: "2rem", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "8px", textAlign: "center" }}>No hay marcas registradas aún.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {brands.map(brand => (
            <div key={brand.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem 1.5rem", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              {/* Logo display */}
              <div style={{ width: "70px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#050505", borderRadius: "6px", padding: "4px" }}>
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#f5c60b", fontWeight: 700, fontSize: "1.1rem" }}>
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{brand.name}</p>
                <p style={{ color: "#555", fontSize: "0.8rem", margin: "2px 0 0" }}>
                  Orden: {brand.sortOrder} · {brand.isActive ? "🟢 Activa" : "⚫ Inactiva"}
                  {brand.logoUrl && " · Logo configurado"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleEdit(brand)} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#f5c60b", border: "1px solid rgba(245,198,11,0.3)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                  Editar
                </button>
                {brand.isActive ? (
                  <button onClick={() => handleDeactivate(brand.id)} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Desactivar
                  </button>
                ) : (
                  <button onClick={() => handleActivate(brand.id)} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#f5c60b", border: "1px solid rgba(245,198,11,0.3)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
