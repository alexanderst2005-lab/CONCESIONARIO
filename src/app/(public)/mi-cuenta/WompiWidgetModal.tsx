"use client";
import React, { useState, useEffect } from "react";
import { useUI } from "@/components/UIProvider";

import { createPortal } from "react-dom";

export default function WompiWidgetModal({ vehicleId, vehicleName, buttonText = "⭐ DESTACAR" }: { vehicleId: number, vehicleName: string, buttonText?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useUI();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && plans.length === 0) {
      fetch("/api/planes-destacado")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Map to expected properties
            const mappedPlans = data.map(p => ({
              id: p.id,
              name: p.nombre,
              amount: p.precio,
              duration: p.duracionDias,
              interval: "month"
            }));
            setPlans(mappedPlans);
          }
        });
    }
  }, [isOpen]);

  const handleSubscribe = async (planId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/pagos-destacado/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehiculoId: vehicleId, planId }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Error al iniciar pago", "error");
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
        amountInCents: data.montoEnCentavos,
        reference: data.referencia,
        publicKey: data.wompiPublicKey, // Se inyecta de forma segura desde el backend
        signature: { integrity: data.firmaIntegridad }
      });

      checkout.open(async function (result: any) {
        const transaction = result.transaction;
        console.log("Wompi Transaction Result:", transaction);
        
        try {
          // Sincronización manual síncrona
          const verifyRes = await fetch("/api/pagos-destacado/verificar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              reference: transaction.reference, 
              transactionId: transaction.id, 
              status: transaction.status,
              paymentMethod: transaction.payment_method_type
            }),
          });

          if (!verifyRes.ok) {
            const errData = await verifyRes.json();
            toast(`Error de sincronización: ${errData.message}`, "error");
          } else {
            const verifyData = await verifyRes.json();
            
            if (verifyData.estadoFinal === "aprobado") {
              toast("¡Pago exitoso! Tu vehículo ahora está destacado.", "success");
              setTimeout(() => window.location.reload(), 2000);
            } else if (verifyData.estadoFinal === "rechazado_o_pendiente") {
              toast("El pago se está verificando. Si es aprobado, tu vehículo destacará en un par de minutos.", "success");
              setTimeout(() => window.location.reload(), 4000);
            } else {
              toast(`Pago no aprobado. Revisa tu medio de pago.`, "error");
            }
          }
        } catch (err) {
          toast("Error verificando el pago con el servidor.", "error");
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
        {buttonText}
      </button>

      {mounted && isOpen && createPortal(
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000, padding: "1rem" }}>
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
        </div>,
        document.body
      )}
    </>
  );
}
