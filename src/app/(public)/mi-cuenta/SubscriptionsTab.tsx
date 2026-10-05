"use client";
import React, { useEffect, useState } from "react";
import { useUI } from "@/components/UIProvider";
import WompiWidgetModal from "./WompiWidgetModal";

export default function SubscriptionsTab({ userId }: { userId: number }) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useUI();
  
  // Modal states
  const [cancelModalSub, setCancelModalSub] = useState<any | null>(null);
  const [reactivateModalSub, setReactivateModalSub] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mi-cuenta/suscripciones");
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

  const handleCancel = async () => {
    if (!cancelModalSub) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/mi-cuenta/suscripciones/${cancelModalSub.id}/cancel`, {
        method: "POST"
      });
      if (res.ok) {
        toast("Renovación cancelada correctamente", "success");
        setCancelModalSub(null);
        fetchSubscriptions();
      } else {
        toast("Error al cancelar la suscripción", "error");
      }
    } catch (e) {
      toast("Error de red", "error");
    }
    setIsProcessing(false);
  };

  const handleReactivate = async () => {
    if (!reactivateModalSub) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/mi-cuenta/suscripciones/${reactivateModalSub.id}/reactivate`, {
        method: "POST"
      });
      if (res.ok) {
        toast("Suscripción reactivada correctamente", "success");
        setReactivateModalSub(null);
        fetchSubscriptions();
      } else {
        toast("Error al reactivar la suscripción", "error");
      }
    } catch (e) {
      toast("Error de red", "error");
    }
    setIsProcessing(false);
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
            const isExpired = sub.status === 'expired' || sub.status === 'FINISHED';
            const isPastDue = sub.status === 'past_due';
            const vehicle = sub.vehicle;
            
            return (
              <div key={sub.id} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "var(--gold-accent)" }}>⭐ Vehículo destacado</h3>
                <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1.2rem" }}>{vehicle.brand.name} {vehicle.model.name}</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", color: "#ccc", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  <p style={{ margin: 0 }}><strong>Plan:</strong> {sub.plan?.name || "Básico"}</p>
                  <p style={{ margin: 0 }}><strong>Valor:</strong> ${(sub.amount || 0).toLocaleString('es-CO')} (Pago único)</p>
                  <p style={{ margin: 0 }}>
                    <strong>Estado:</strong> {isActive ? 'Activo' : isExpired ? 'Finalizado' : 'Pendiente'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Vehículo:</strong> {vehicle.isFeatured ? 'Destacado' : 'Normal'}
                  </p>
                </div>

                {isExpired ? (
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h4 style={{ color: "#aaa", margin: "0 0 0.5rem 0" }}>Destacado Finalizado</h4>
                    <p style={{ color: "#ccc", margin: 0, fontSize: "0.9rem", marginBottom: "1rem" }}>
                      El periodo ha terminado y tu vehículo ya no está destacado. Puedes volver a destacarlo.
                    </p>
                    <WompiWidgetModal 
                      vehicleId={vehicle.id} 
                      vehicleName={`${vehicle.brand?.name} ${vehicle.model?.name}`} 
                      buttonText="VOLVER A DESTACAR" 
                    />
                  </div>
                ) : isActive ? (
                  <div style={{ background: "rgba(16,185,129,0.1)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <h4 style={{ color: "#10b981", margin: "0 0 0.5rem 0" }}>Destacado activo</h4>
                    <p style={{ color: "#ccc", margin: 0, fontSize: "0.9rem" }}>
                      Este es un pago único sin renovación automática. Tu vehículo continuará destacado hasta el {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO') : '-'}.
                    </p>
                    <p style={{ color: "#fff", margin: "0.5rem 0 0 0", fontWeight: "bold" }}>
                      Fecha de finalización: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO') : '-'}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Premium Modal */}
      {cancelModalSub && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(5px)", padding: "1rem"
        }}>
          <div style={{
            background: "#111", border: "1px solid var(--gold-accent)", borderRadius: "12px",
            padding: "2rem", maxWidth: "500px", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <h2 className="serif-title" style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1.8rem" }}>¿Estás seguro de cancelar tu suscripción?</h2>
            
            <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", color: "#ccc", fontSize: "0.95rem", lineHeight: "1.5" }}>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#aaa" }}>
                <li style={{ marginBottom: "0.5rem" }}><strong style={{color:"#fff"}}>El vehículo continuará destacado</strong> hasta la fecha de finalización del periodo ya pagado.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong style={{color:"#fff"}}>No se realizarán nuevos cobros</strong> después de la cancelación.</li>
                <li style={{ marginBottom: "0.5rem" }}><strong style={{color:"#fff"}}>Dejará de estar destacado</strong> cuando finalice el periodo vigente.</li>
                <li>Después pasará automáticamente al <strong style={{color:"#fff"}}>inventario normal</strong>.</li>
              </ul>
            </div>

            <div style={{ marginBottom: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}><strong>Vehículo:</strong> {cancelModalSub.vehicle?.brand?.name} {cancelModalSub.vehicle?.model?.name}</p>
              <p style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}><strong>Plan:</strong> {cancelModalSub.plan?.name || "Premium"}</p>
              <p style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}><strong>Valor:</strong> ${(cancelModalSub.amount || 0).toLocaleString('es-CO')}</p>
              <p style={{ margin: "0 0 0.5rem 0", color: "#ccc" }}><strong>Fecha del próximo cobro:</strong> {cancelModalSub.nextBillingDate ? new Date(cancelModalSub.nextBillingDate).toLocaleDateString('es-CO') : '-'}</p>
              <p style={{ margin: "0", color: "#f87171" }}><strong>Fecha estimada de finalización:</strong> {cancelModalSub.currentPeriodEnd ? new Date(cancelModalSub.currentPeriodEnd).toLocaleDateString('es-CO') : '-'}</p>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
              <button 
                onClick={() => setCancelModalSub(null)}
                style={{ padding: "1rem", background: "var(--interaction-color)", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", transition: "0.2s" }}
              >
                Volver / Mantener suscripción
              </button>
              <button 
                onClick={handleCancel}
                disabled={isProcessing}
                style={{ padding: "1rem", background: "transparent", color: "#f87171", border: "1px solid rgba(248,113,113,0.4)", borderRadius: "6px", cursor: isProcessing ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1rem", opacity: isProcessing ? 0.7 : 1, transition: "0.2s" }}
              >
                {isProcessing ? "Cancelando..." : "Sí, cancelar suscripción"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Premium Modal */}
      {reactivateModalSub && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(5px)", padding: "1rem"
        }}>
          <div style={{
            background: "#111", border: "1px solid var(--gold-accent)", borderRadius: "12px",
            padding: "2rem", maxWidth: "500px", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <h2 className="serif-title" style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1.8rem" }}>Reactivar suscripción</h2>
            
            <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", color: "#ccc", fontSize: "0.95rem", lineHeight: "1.5" }}>
              <p style={{ margin: "0 0 1rem 0" }}>¿Estás seguro que deseas reactivar la suscripción para tu <strong>{reactivateModalSub.vehicle?.brand?.name} {reactivateModalSub.vehicle?.model?.name}</strong>?</p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#aaa" }}>
                <li style={{ marginBottom: "0.5rem" }}>Se volverá a <strong style={{color:"#fff"}}>activar la renovación automática</strong>.</li>
                <li style={{ marginBottom: "0.5rem" }}>El vehículo se <strong style={{color:"#fff"}}>mantendrá destacado</strong> sin interrupciones.</li>
                <li>Se programará el próximo cobro para el <strong style={{color:"#fff"}}>{reactivateModalSub.nextBillingDate ? new Date(reactivateModalSub.nextBillingDate).toLocaleDateString('es-CO') : '-'}</strong>.</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
              <button 
                onClick={handleReactivate}
                disabled={isProcessing}
                style={{ padding: "1rem", background: "var(--interaction-color)", color: "#000", border: "none", borderRadius: "6px", cursor: isProcessing ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "1rem", opacity: isProcessing ? 0.7 : 1, transition: "0.2s" }}
              >
                {isProcessing ? "Reactivando..." : "Sí, reactivar suscripción"}
              </button>
              <button 
                onClick={() => setReactivateModalSub(null)}
                style={{ padding: "1rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", transition: "0.2s" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
