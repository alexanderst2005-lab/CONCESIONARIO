"use client";

import React, { useState, useEffect } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", isActive: true, subtypes: "", brandsList: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse subtypes string to JSON array
    const subtypesArray = form.subtypes 
      ? form.subtypes.split(',').map(s => s.trim()).filter(s => s) 
      : [];
      
    // Parse brandsList string to JSON array
    const brandsArray = form.brandsList 
      ? form.brandsList.split(',').map(s => s.trim()).filter(s => s) 
      : [];

    const payload = { 
      ...form, 
      subtypes: JSON.stringify(subtypesArray),
      brandsList: JSON.stringify(brandsArray)
    };

    if (editingId) {
      await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ name: "", isActive: true, subtypes: "", brandsList: "" });
    setEditingId(null);
    fetchCategories();
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("¿Desactivar esta categoría?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem", background: "#050505", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px", color: "#fff", outline: "none",
  };

  return (
    <div>
      <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff", marginBottom: "2rem" }}>Tipos de Vehículo</h1>

      <form onSubmit={handleSubmit} style={{ background: "#080808", padding: "1.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>NOMBRE DEL TIPO</label>
          <input type="text" style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ej: Camiones" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>SUBTIPOS (Separados por coma)</label>
          <input type="text" style={inputStyle} value={form.subtypes || ""} onChange={e => setForm(p => ({ ...p, subtypes: e.target.value }))} placeholder="Ej: Furgón, Estacas" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>MARCAS (Separadas por coma)</label>
          <input type="text" style={inputStyle} value={form.brandsList || ""} onChange={e => setForm(p => ({ ...p, brandsList: e.target.value }))} placeholder="Ej: Foton, JAC, Hino" />
        </div>
        <div style={{ flex: "1 1 100%", display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" style={{ padding: "0.8rem 2rem", background: "var(--gold-accent)", color: "#000", fontWeight: "bold", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            {editingId ? "Actualizar" : "Agregar Tipo"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", isActive: true, subtypes: "", brandsList: "" }); }} style={{ padding: "0.8rem 1rem", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", cursor: "pointer" }}>
              Cancelar
            </button>
          )}
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
              
              const brandsStr = (() => {
                try {
                  const arr = JSON.parse(cat.brandsList);
                  return Array.isArray(arr) ? arr.join(', ') : "";
                } catch(e) { return cat.brandsList || ""; }
              })();
              
              return (
              <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", background: "#050505" }}>
                <div>
                  <h3 style={{ color: "#fff", margin: 0 }}>{cat.name}</h3>
                  <p style={{ margin: "0.25rem 0", color: "#888", fontSize: "0.85rem" }}>{subtypesStr ? `Subtipos: ${subtypesStr}` : "Sin subtipos"}</p>
                  <p style={{ margin: "0", color: "#888", fontSize: "0.85rem" }}>{brandsStr ? `Marcas: ${brandsStr}` : "Sin marcas específicas"}</p>
                  <span style={{ fontSize: "0.8rem", color: cat.isActive ? "#4ade80" : "#f87171" }}>{cat.isActive ? "Activo" : "Inactivo"}</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => { setEditingId(cat.id); setForm({ name: cat.name, isActive: cat.isActive, subtypes: subtypesStr, brandsList: brandsStr }); }} style={{ padding: "0.5rem 1rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
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
