"use client";

import React, { useEffect, useState } from "react";
import { useUI } from "@/components/UIProvider";

/**
 * Admin — Planes de Destacados (tabla planes_destacado).
 * Precio y duración viven en la BD: editar aquí cambia lo que ven y pagan los
 * usuarios en compras NUEVAS. Pagos ya iniciados conservan el precio/duración
 * con que se crearon. Los planes no se eliminan, se desactivan.
 */

type Plan = {
  id: number;
  nombre: string;
  duracionDias: number;
  precio: number;
  activo: boolean;
};

const th: React.CSSProperties = { padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "1rem", color: "#ccc" };
const input: React.CSSProperties = { width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" };
const label: React.CSSProperties = { display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" };

const cop = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

export default function PromotionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({ nombre: "", duracionDias: "", precio: "" });

  const { toast } = useUI();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/planes-destacado", { cache: "no-store" });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast("Error al cargar los planes", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/planes-destacado", {
        method: editingPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan?.id,
          nombre: formData.nombre,
          duracionDias: Number(formData.duracionDias),
          precio: Number(formData.precio),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast(editingPlan ? "Plan actualizado" : "Plan creado", "success");
        setIsModalOpen(false);
        fetchPlans();
      } else {
        toast(body?.message || "Error al guardar el plan", "error");
      }
    } catch {
      toast("Error interno", "error");
    }
    setSaving(false);
  };

  const toggleStatus = async (plan: Plan) => {
    try {
      const res = await fetch("/api/admin/planes-destacado", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, activo: !plan.activo }),
      });
      if (res.ok) {
        toast(plan.activo ? "Plan desactivado" : "Plan activado", "success");
        fetchPlans();
      } else {
        toast("No se pudo cambiar el estado", "error");
      }
    } catch {
      toast("Error al cambiar estado", "error");
    }
  };

  const openModal = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    setFormData(plan
      ? { nombre: plan.nombre, duracionDias: String(plan.duracionDias), precio: String(plan.precio) }
      : { nombre: "", duracionDias: "", precio: "" });
    setIsModalOpen(true);
  };

  const diasN = Number(formData.duracionDias);
  const precioN = Number(formData.precio);
  const precioDiaPreview = diasN > 0 && precioN > 0 ? cop(precioN / diasN) : "—";

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Planes de Destacados</h1>
          <p style={{ color: "#aaa", margin: 0 }}>Pago único por periodo. Si el usuario ya tiene un destacado vigente, los días nuevos se suman al final.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
          + Nuevo Plan
        </button>
      </div>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={th}>Plan</th>
              <th style={th}>Duración</th>
              <th style={th}>Precio total</th>
              <th style={th}>Precio por día</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando planes...</td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay planes creados. ¡Crea el primero!</td></tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={{ ...td, color: "#fff", fontWeight: 600 }}>{plan.nombre}</td>
                  <td style={td}>{plan.duracionDias} {plan.duracionDias === 1 ? "día" : "días"}</td>
                  <td style={{ ...td, color: "var(--gold-accent)", fontWeight: 600 }}>{cop(plan.precio)}</td>
                  <td style={td}>{cop(plan.precio / plan.duracionDias)}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: plan.activo ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)',
                      color: plan.activo ? '#4ade80' : '#f87171'
                    }}>
                      {plan.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => openModal(plan)} style={{ padding: "0.4rem 0.75rem", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Editar</button>
                    <button onClick={() => toggleStatus(plan)} style={{ padding: "0.4rem 0.75rem", background: plan.activo ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)", color: plan.activo ? "#f87171" : "#4ade80", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                      {plan.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "520px", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={label}>Nombre del plan (Ej: Básico)</label>
                <input required type="text" maxLength={60} minLength={2} value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={input} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={label}>Duración (días)</label>
                  <input required type="number" min={1} max={365} step={1} value={formData.duracionDias} onChange={e => setFormData({ ...formData, duracionDias: e.target.value })} style={input} placeholder="Ej: 15" />
                </div>
                <div>
                  <label style={label}>Precio total (COP)</label>
                  <input required type="number" min={1000} step={1} value={formData.precio} onChange={e => setFormData({ ...formData, precio: e.target.value })} style={input} placeholder="Ej: 75000" />
                </div>
              </div>

              <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#ccc", fontSize: "0.9rem" }}>
                Precio por día: <strong style={{ color: "var(--gold-accent)" }}>{precioDiaPreview}</strong>
              </div>

              {editingPlan && (
                <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>
                  Los cambios aplican solo a compras nuevas. Los pagos ya iniciados conservan su precio y duración originales.
                </p>
              )}

              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "0.75rem 1.5rem", background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ padding: "0.75rem 1.5rem", background: "var(--gold-accent)", color: "#000", border: "none", borderRadius: "8px", cursor: saving ? "wait" : "pointer", fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Guardando..." : "Guardar Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
