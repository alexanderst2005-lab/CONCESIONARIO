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
    interval: "month",
    duration: "30",
    durationUnit: "días",
    benefits: "",
    autoRenew: true
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
      
      const benefitsArray = formData.benefits.split("\n").map(b => b.trim()).filter(b => b);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPlan?.id,
          name: formData.name,
          description: formData.description,
          amount: formData.amount,
          interval: formData.interval,
          duration: formData.duration,
          durationUnit: formData.durationUnit,
          benefits: benefitsArray,
          autoRenew: formData.autoRenew
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
        interval: plan.interval,
        duration: plan.duration?.toString() || "30",
        durationUnit: plan.durationUnit || "días",
        benefits: Array.isArray(plan.benefits) ? plan.benefits.join("\n") : "",
        autoRenew: plan.autoRenew !== undefined ? plan.autoRenew : true
      });
    } else {
      setEditingPlan(null);
      setFormData({ 
        name: "", description: "", amount: "", interval: "month",
        duration: "30", durationUnit: "días", benefits: "Vehículo destacado\nMayor visibilidad", autoRenew: true
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Planes de Destacados</h1>
          <p style={{ color: "#aaa", margin: 0 }}>Crea y gestiona los planes y suscripciones para los clientes.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
          + Nuevo Plan
        </button>
      </div>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Plan</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Precio</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Duración</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Renovación</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
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
                  <td style={{ padding: "1rem", color: "#fff", fontWeight: 600 }}>{plan.name}</td>
                  <td style={{ padding: "1rem", color: "var(--gold-accent)", fontWeight: 600 }}>
                    ${parseInt(plan.amount).toLocaleString('es-CO')}
                  </td>
                  <td style={{ padding: "1rem", color: "#ccc" }}>
                    {plan.duration} {plan.durationUnit}
                  </td>
                  <td style={{ padding: "1rem", color: "#ccc" }}>
                    {plan.autoRenew ? 'Sí (Automática)' : 'No (Pago único)'}
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
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
          <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "600px", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Nombre del Plan (Ej: Plan Plata)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Precio del cobro (COP)</label>
                  <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} placeholder="Ej: 20000" />
                </div>
                <div>
                  <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Frecuencia de cobro (Intervalo)</label>
                  <select value={formData.interval} onChange={e => setFormData({...formData, interval: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }}>
                    <option value="month">Mensual</option>
                    <option value="year">Anual</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Duración (Número)</label>
                  <input required type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} placeholder="Ej: 30" />
                </div>
                <div>
                  <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Unidad de duración</label>
                  <select value={formData.durationUnit} onChange={e => setFormData({...formData, durationUnit: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }}>
                    <option value="días">Días</option>
                    <option value="semanas">Semanas</option>
                    <option value="meses">Meses</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", marginTop: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.autoRenew} onChange={e => setFormData({...formData, autoRenew: e.target.checked})} style={{ width: "18px", height: "18px" }} />
                  ¿Renovación automática? (Se cobrará automáticamente al terminar el periodo)
                </label>
              </div>

              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Beneficios (Uno por línea)</label>
                <textarea required value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px", minHeight: "100px", fontFamily: "inherit" }} placeholder="Mayor visibilidad&#10;Aparece primero&#10;Duración de 30 días"></textarea>
              </div>

              <div>
                <label style={{ display: "block", color: "#888", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Descripción corta</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", padding: "0.75rem", background: "#222", border: "1px solid #333", color: "#fff", borderRadius: "6px" }} placeholder="Ej: Ideal para destacar tu vehículo rápido" />
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
