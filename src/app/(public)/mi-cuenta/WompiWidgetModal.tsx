"use client";
import React, { useState, useEffect } from "react";
import { useUI } from "@/components/UIProvider";

export default function WompiWidgetModal({ vehicleId, vehicleName }: { vehicleId: number, vehicleName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useUI();

  useEffect(() => {
    if (isOpen && plans.length === 0) {
      fetch("/api/admin/promotions/plans")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPlans(data.filter(p => p.active));
          }
        });
    }
  }, [isOpen]);

  const handleSubscribe = async (planId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, planId }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Error al iniciar suscripción", "error");
        setLoading(false);
        return;
      }

      // Cargar el script de Wompi dinámicamente si no está en la página
      if (!document.getElementById("wompi-widget-script")) {
        const script = document.createElement("script");
        script.id = "wompi-widget-script";
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // @ts-ignore
      const checkout = new (window as any).WidgetCheckout({
        currency: 'COP',
        amountInCents: data.amountInCents,
        reference: data.reference,
        publicKey: data.wompiPublicKey, // Se inyecta de forma segura desde el backend
        signature: { integrity: data.signature }
      });

      checkout.open(function (result: any) {
        const transaction = result.transaction;
        console.log("Wompi Transaction Result:", transaction);
        
        if (transaction.status === "APPROVED") {
          toast("¡Pago exitoso! Tu vehículo ahora está destacado.", "success");
          setTimeout(() => window.location.reload(), 2000);
        } else {
          toast(`Pago ${transaction.status}. Intenta nuevamente.`, "error");
        }
      });
      
      // Permitimos que el usuario intente de nuevo si cierra la pasarela
      setLoading(false);
    } catch (e) {
      console.error(e);
      toast("Error de conexión", "error");
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ padding: "0.4rem 0.75rem", background: "rgba(245,198,11,0.1)", color: "var(--gold-accent)", border: "1px solid var(--gold-accent)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
      >
        ⭐ DESTACAR
      </button>

      {isOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <h2 style={{ color: "var(--gold-accent)", marginBottom: "1rem" }}>⭐ Destacar Vehículo</h2>
            <p style={{ color: "#ccc", marginBottom: "1.5rem" }}>
              Haz que tu <strong>{vehicleName}</strong> tenga mayor visibilidad. Selecciona uno de los planes disponibles.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
              {plans.length === 0 ? (
                <p style={{ color: "#888", textAlign: "center" }}>No hay planes disponibles en este momento.</p>
              ) : (
                plans.map(plan => (
                  <div key={plan.id} style={{ border: "1px solid #333", borderRadius: "8px", padding: "1.5rem", background: "#1a1a1a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0, color: "#fff" }}>{plan.name}</h3>
                      <span style={{ color: "var(--gold-accent)", fontWeight: "bold", fontSize: "1.2rem" }}>${plan.amount.toLocaleString('es-CO')}</span>
                    </div>
                    <p style={{ color: "#888", fontSize: "0.9rem", margin: "0 0 1rem 0" }}>{plan.description}</p>
                    <button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading}
                      style={{ width: "100%", padding: "0.75rem", background: "var(--gold-accent)", color: "#000", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}
                    >
                      {loading ? "Procesando..." : `Suscribirme por $${plan.amount.toLocaleString('es-CO')}/${plan.interval === 'month' ? 'mes' : 'año'}`}
                    </button>
                    <p style={{ fontSize: "0.75rem", color: "#666", textAlign: "center", marginTop: "0.5rem" }}>
                      Al suscribirte autorizas los cobros recurrentes. Cancela cuando quieras.
                    </p>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setIsOpen(false)} style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: "6px", cursor: "pointer" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
