"use client";

import React, { useEffect, useState } from "react";
import { useUI } from "@/components/UIProvider";

export default function PromotionPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    interval: "month"
  });

  const { toast } = useUI();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions/plans");
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
    try {
      const url = "/api/admin/promotions/plans";
      const method = editingPlan ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan?.id,
          ...formData
        }),
      });
      
      if (res.ok) {
        toast(editingPlan ? "Plan actualizado" : "Plan creado", "success");
        setIsModalOpen(false);
        fetchPlans();
      } else {
        toast("Error al guardar el plan", "error");
      }
    } catch (e) {
      toast("Error interno", "error");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/promotions/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentStatus }),
      });
      if (res.ok) {
        toast(currentStatus ? "Plan desactivado" : "Plan activado", "success");
        fetchPlans();
      }
    } catch (e) {
      toast("Error al cambiar estado", "error");
    }
  };

  const openModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        amount: plan.amount.toString(),
        interval: plan.interval
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", description: "", amount: "", interval: "month" });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Planes de Destacados</h1>
          <p style={{ color: "#aaa", margin: 0 }}>Crea y gestiona las suscripciones recurrentes para los clientes.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
          + Nuevo Plan
        </button>
      </div>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Nombre del Plan</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Cobro</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Frecuencia</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando planes...</td></tr>
            ) : plans.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay planes creados. ¡Crea el primero!</td></tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "1rem", color: "#fff", fontWeight: 600 }}>{plan.name}</td>
                  <td style={{ padding: "1rem", color: "var(--gold-accent)", fontWeight: 600 }}>
                    ${parseInt(plan.amount).toLocaleString('es-CO')}
                  </td>
                  <td style={{ padding: "1rem", color: "#ccc" }}>
                    {plan.interval === 'month' ? 'Mensual' : 'Anual'}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "4px", 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      backgroundColor: plan.active ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)',
                      color: plan.active ? '#4ade80' : '#f87171'
                    }}>
                      {plan.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => openModal(plan)} style={{ padding: "0.4rem 0.75rem", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Editar</button>
                    <button onClick={() => toggleStatus(plan.id, plan.active)} style={{ padding: "0.4rem 0.75rem", background: plan.active ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)", color: plan.active ? "#f87171" : "#4ade80", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                      {plan.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Nombre del Plan (Ej: Destacado Mensual)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Precio del cobro (COP)</label>
                <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} placeholder="Ej: 49900" />
              </div>

              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Frecuencia de cobro</label>
                <select value={formData.interval} onChange={e => setFormData({...formData, interval: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }}>
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Descripción / Beneficios</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px", minHeight: "100px" }} placeholder="Mayor visibilidad, etiqueta de destacado..."></textarea>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "0.75rem 1.5rem", background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "var(--gold-accent)", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Guardar Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
