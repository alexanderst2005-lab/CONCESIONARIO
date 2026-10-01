"use client";

import React, { useState, useEffect } from "react";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", logoUrl: "", sortOrder: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchBrands = async () => {
    setLoading(true);
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(data);
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("¿Desactivar esta marca?")) return;
    await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    fetchBrands();
  };

  const handleActivate = async (id: number) => {
    await fetch("/api/brands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    fetchBrands();
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

  return (
    <div style={{ padding: "2rem 0" }}>
      <h2 style={{ color: "#fff", fontSize: "1.75rem", marginBottom: "2rem", fontWeight: 400 }}>
        {editingId ? "Editar Marca" : "Agregar Marca"}
      </h2>

      {message && (
        <div style={{ padding: "1rem", background: "#0a0a0a", border: "1px solid rgba(245,198,11,0.3)", borderRadius: "6px", color: "#f5c60b", marginBottom: "2rem", fontSize: "0.9rem" }}>
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

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>URL del Logo (imagen externa o /logos/mazda.png)</label>
          <input
            type="text"
            style={inputStyle}
            placeholder="https://... o /logos/mazda.png"
            value={form.logoUrl}
            onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))}
          />
          {form.logoUrl && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#050505", borderRadius: "6px", display: "flex", alignItems: "center", gap: "1rem" }}>
              <img src={form.logoUrl} alt="preview" style={{ width: "80px", height: "50px", objectFit: "contain" }} onError={e => (e.currentTarget.style.display = "none")} />
              <span style={{ color: "#888", fontSize: "0.85rem" }}>Vista previa del logo</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" disabled={saving} style={{ padding: "0.875rem 2rem", background: "#f5c60b", color: "#000", fontWeight: 700, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.95rem" }}>
            {saving ? "Guardando..." : editingId ? "Actualizar Marca" : "Guardar Marca"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", logoUrl: "", sortOrder: 0 }); }} style={{ padding: "0.875rem 2rem", background: "transparent", color: "#aaa", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer" }}>
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
              <div style={{ width: "60px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#f5c60b", fontWeight: 700 }}>
                    {brand.name.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{brand.name}</p>
                <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>Orden: {brand.sortOrder} · {brand.isActive ? "Activa" : "Inactiva"}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleEdit(brand)} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
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
