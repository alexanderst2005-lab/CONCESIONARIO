"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/components/UIProvider";
import WompiWidgetModal from "./WompiWidgetModal";

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
      "¿Cancelar suscripción?\nAl cancelar, no se realizarán nuevos cobros recurrentes. Tu vehículo continuará destacado hasta finalizar el período que ya fue pagado. Después de esa fecha dejará automáticamente de aparecer como destacado.",
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
            const vehicle = sub.vehicle;
            
            return (
              <div key={sub.id} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "var(--gold-accent)" }}>⭐ Vehículo destacado</h3>
                <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1.2rem" }}>{vehicle.brand.name} {vehicle.model.name}</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", color: "#ccc", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  <p style={{ margin: 0 }}><strong>Plan:</strong> {sub.plan.name}</p>
                  <p style={{ margin: 0 }}><strong>Valor:</strong> ${sub.amount.toLocaleString('es-CO')} / {sub.plan.interval === 'month' ? 'mes' : 'año'}</p>
                  <p style={{ margin: 0 }}>
                    <strong>Estado:</strong> {isActive ? 'Activa' : 'Cancelada'}
                  </p>
                  {!isCanceled && sub.nextBillingDate && (
                    <p style={{ margin: 0 }}><strong>Próximo cobro:</strong> {new Date(sub.nextBillingDate).toLocaleDateString('es-CO')}</p>
                  )}
                  <p style={{ margin: 0 }}>
                    <strong>Vehículo:</strong> {vehicle.isFeatured ? 'Destacado' : 'Normal'}
                  </p>
                </div>

                {isCanceled ? (
                  <div style={{ background: "rgba(248,113,113,0.1)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <h4 style={{ color: "#f87171", margin: "0 0 0.5rem 0" }}>Suscripción cancelada</h4>
                    <p style={{ color: "#ccc", margin: 0, fontSize: "0.9rem" }}>
                      No se realizarán nuevos cobros. Tu vehículo continuará destacado hasta el {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO') : '-'}.
                    </p>
                    <p style={{ color: "#fff", margin: "0.5rem 0 0 0", fontWeight: "bold" }}>
                      Fecha de finalización: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO') : '-'}
                    </p>
                  </div>
                ) : sub.status === 'past_due' ? (
                  <div style={{ background: "rgba(248,113,113,0.1)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <h4 style={{ color: "#f87171", margin: "0 0 0.5rem 0" }}>🔴 Renovación fallida</h4>
                    <p style={{ color: "#ccc", margin: 0, fontSize: "0.9rem", marginBottom: "1rem" }}>
                      No pudimos procesar el pago de renovación. Tu vehículo volvió al inventario normal.
                    </p>
                    <WompiWidgetModal 
                      vehicleId={vehicle.id} 
                      vehicleName={`${vehicle.brand?.name} ${vehicle.model?.name}`} 
                      buttonText="RENOVAR SUSCRIPCIÓN" 
                    />
                  </div>
                ) : (
                  <div>
                    <button 
                      onClick={() => handleCancel(sub.id)}
                      style={{ padding: "0.5rem 1.5rem", background: "transparent", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Cancelar suscripción
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
