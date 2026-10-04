"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/components/UIProvider";

export default function SubscriptionsTab({ userId }: { userId: number }) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, confirmAction } = useUI();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast("Error al cargar suscripciones", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancel = (subId: number) => {
    confirmAction(
      "¿Quieres cancelar tu suscripción?\nAl cancelar, no se realizarán nuevos cobros recurrentes. Tu vehículo permanecerá destacado hasta finalizar el período que ya fue pagado.",
      async () => {
        try {
          const res = await fetch(`/api/subscriptions/${subId}/cancel`, {
            method: "POST"
          });
          if (res.ok) {
            toast("Suscripción cancelada correctamente", "success");
            fetchSubscriptions();
          } else {
            toast("Error al cancelar la suscripción", "error");
          }
        } catch (e) {
          toast("Error de red", "error");
        }
      }
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Mis Suscripciones</h1>
        <p style={{ color: "#aaa", margin: 0 }}>Gestiona los pagos recurrentes y destacados de tus vehículos.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>Cargando tus suscripciones...</p>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#666", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
            No tienes ninguna suscripción activa en este momento.
          </div>
        ) : (
          subscriptions.map((sub: any) => {
            const isCanceled = sub.status === 'canceled';
            const isActive = sub.status === 'active';
            const statusColor = isActive ? "#4ade80" : isCanceled ? "#f87171" : "#fbbf24";
            
            return (
              <div key={sub.id} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>{sub.vehicle.brand.name} {sub.vehicle.model.name} - {sub.plan.name}</h3>
                  <div style={{ display: "flex", gap: "1rem", color: "#888", fontSize: "0.9rem" }}>
                    <p style={{ margin: 0 }}><strong>Valor:</strong> ${sub.amount.toLocaleString('es-CO')} / {sub.plan.interval === 'month' ? 'mes' : 'año'}</p>
                    <p style={{ margin: 0 }}>
                      <strong>Estado:</strong> 
                      <span style={{ color: statusColor, fontWeight: "bold", marginLeft: "0.25rem" }}>
                        {sub.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  {isActive && sub.nextBillingDate && (
                    <p style={{ margin: "0.5rem 0 0 0", color: "#ccc", fontSize: "0.85rem" }}>
                      Próximo cobro: {new Date(sub.nextBillingDate).toLocaleDateString('es-CO')}
                    </p>
                  )}
                  {isCanceled && sub.currentPeriodEnd && (
                    <p style={{ margin: "0.5rem 0 0 0", color: "#f87171", fontSize: "0.85rem" }}>
                      Se quitará el destacado el: {new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO')}
                    </p>
                  )}
                </div>
                
                <div>
                  {isActive && (
                    <button 
                      onClick={() => handleCancel(sub.id)}
                      style={{ padding: "0.5rem 1rem", background: "transparent", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Cancelar Suscripción
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
