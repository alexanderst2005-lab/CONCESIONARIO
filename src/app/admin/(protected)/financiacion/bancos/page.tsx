"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Check, Building } from "lucide-react";
import { useUI } from "@/components/UIProvider";

interface Bank {
  id: number;
  name: string;
  rate: string;
  terms: number[];
  isActive: boolean;
}

export default function BancosAdminPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useUI();

  const defaultTerms = [12, 24, 36, 48, 60, 72];

  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    terms: defaultTerms,
    isActive: true,
  });

  const fetchBanks = async () => {
    try {
      const res = await fetch("/api/banks");
      if (res.ok) {
        const data = await res.json();
        setBanks(data);
      }
    } catch (error) {
      toast("Error al cargar los bancos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.rate) {
      toast("Nombre y tasa son requeridos", "error");
      return;
    }

    try {
      const url = isEditing ? `/api/banks/${isEditing}` : "/api/banks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast(isEditing ? "Banco actualizado" : "Banco creado", "success");
        setIsAdding(false);
        setIsEditing(null);
        fetchBanks();
      } else {
        toast("Error al guardar el banco", "error");
      }
    } catch (error) {
      toast("Error de conexión", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este banco?")) return;
    try {
      const res = await fetch(`/api/banks/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Banco eliminado", "success");
        fetchBanks();
      }
    } catch (error) {
      toast("Error al eliminar", "error");
    }
  };

  const startEdit = (bank: Bank) => {
    setIsEditing(bank.id);
    setIsAdding(true);
    setFormData({
      name: bank.name,
      rate: bank.rate,
      terms: bank.terms || defaultTerms,
      isActive: bank.isActive,
    });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ name: "", rate: "", terms: defaultTerms, isActive: true });
  };

  const toggleTerm = (term: number) => {
    setFormData((prev) => ({
      ...prev,
      terms: prev.terms.includes(term)
        ? prev.terms.filter((t) => t !== term)
        : [...prev.terms, term].sort((a, b) => a - b),
    }));
  };

  return (
    <div style={{ padding: "2rem", color: "#fff", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={28} color="#cda434" /> Bancos y Financiación
          </h1>
          <p style={{ color: "#aaa", marginTop: "0.5rem" }}>Gestiona las entidades financieras, tasas y plazos.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setFormData({ name: "", rate: "", terms: defaultTerms, isActive: true }); }}
            style={{ background: "#cda434", color: "#000", border: "none", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
          >
            <Plus size={20} /> Agregar Banco
          </button>
        )}
      </div>

      {isAdding && (
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1.5rem", color: "#cda434" }}>{isEditing ? "Editar Banco" : "Nuevo Banco"}</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Nombre del Banco</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }}
                placeholder="Ej: Bancolombia"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Tasa de Interés (%)</label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff" }}
                placeholder="Ej: 1.5"
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#aaa" }}>Plazos Disponibles (Meses)</label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {defaultTerms.map(term => (
                <button
                  key={term}
                  onClick={() => toggleTerm(term)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: formData.terms.includes(term) ? "#cda434" : "rgba(255,255,255,0.2)",
                    background: formData.terms.includes(term) ? "rgba(205,164,52,0.2)" : "transparent",
                    color: formData.terms.includes(term) ? "#cda434" : "#aaa",
                    cursor: "pointer"
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "#cda434" }}
            />
            <label htmlFor="isActive" style={{ color: "#aaa", cursor: "pointer" }}>Banco Activo (Visible en el simulador)</label>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={handleSave} style={{ background: "#cda434", color: "#000", border: "none", padding: "0.8rem 1.5rem", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <Save size={18} /> Guardar
            </button>
            <button onClick={cancelEdit} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.8rem 1.5rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <X size={18} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)" }}>
            <tr>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Banco</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Tasa (%)</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Plazos</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Estado</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Cargando bancos...</td></tr>
            ) : banks.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>No hay bancos registrados.</td></tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem", fontWeight: "bold" }}>{bank.name}</td>
                  <td style={{ padding: "1rem" }}>{bank.rate}%</td>
                  <td style={{ padding: "1rem", color: "#aaa" }}>{bank.terms?.join(", ") || "-"} meses</td>
                  <td style={{ padding: "1rem" }}>
                    {bank.isActive ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#34d399", fontSize: "0.9rem", background: "rgba(52,211,153,0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                        <Check size={14} /> Activo
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#f87171", fontSize: "0.9rem", background: "rgba(248,113,113,0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                        <X size={14} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button onClick={() => startEdit(bank)} style={{ background: "transparent", border: "none", color: "#3b82f6", cursor: "pointer", padding: "0.5rem", marginRight: "0.5rem" }} title="Editar">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(bank.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }} title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
