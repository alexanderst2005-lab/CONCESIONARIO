"use client";

import React, { useState, useEffect } from "react";
import styles from "./PlansTab.module.css";
import { useUI } from "@/components/UIProvider";
import { Star, CheckCircle2, ChevronRight, Check } from "lucide-react";

export default function PlansTab({ userId, userVehicles }: { userId: number, userVehicles: any[] }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [step, setStep] = useState<"SELECT_PLAN" | "SELECT_VEHICLE" | "CHECKOUT">("SELECT_PLAN");

  const [processing, setProcessing] = useState(false);
  const { toast } = useUI();

  useEffect(() => {
    // Phase 3: Using the new public plans endpoint
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
            durationUnit: "días",
            interval: p.duracionDias >= 30 ? "month" : "month",
            benefits: [
              "Vehículo Destacado Premium",
              "Posicionamiento en primera página",
              `${p.duracionDias} días de visibilidad`
            ]
          }));
          setPlans(mappedPlans);
        }
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setStep("SELECT_VEHICLE");
  };

  const handleSelectVehicle = (vId: number) => {
    setSelectedVehicleId(vId);
    setStep("CHECKOUT");
  };

  const activeVehicles = userVehicles.filter(v => (v.status === "ACTIVO" || v.status === "approved") && !v.isFeatured);
  const featuredVehicles = userVehicles.filter(v => v.isFeatured);

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedVehicleId) return;
    setProcessing(true);

    try {
      // Phase 3: Initiation of new Wompi flow
      const res = await fetch("/api/pagos-destacado/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehiculoId: selectedVehicleId, planId: selectedPlan.id }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || "Error al iniciar pago", "error");
        setProcessing(false);
        return;
      }

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
        publicKey: data.wompiPublicKey,
        signature: { integrity: data.firmaIntegridad }
      });

      checkout.open(async function (result: any) {
        const transaction = result.transaction;
        
        try {
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
              setTimeout(() => window.location.href = "/mi-cuenta?tab=suscripciones", 2000);
            } else if (verifyData.estadoFinal === "rechazado_o_pendiente") {
              toast("El pago se está verificando. Te notificaremos pronto.", "success");
              setTimeout(() => window.location.href = "/mi-cuenta?tab=suscripciones", 3000);
            } else {
              toast(`Pago no aprobado. Revisa tu medio de pago.`, "error");
            }
          }
        } catch (e) {
          console.error("Error verificando pago:", e);
          toast("Error de red al verificar pago", "error");
        }
      });
      
      setProcessing(false);
    } catch (e) {
      console.error(e);
      toast("Error de conexión", "error");
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Cargando planes increíbles...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleWrapper}>
          <h1 className="serif-title">Planes de Destacado</h1>
          <p>Potencia tus ventas y llega a miles de compradores potenciales al instante.</p>
        </div>
      </div>

      {step === "SELECT_PLAN" && (
        <div className={styles.plansGrid}>
          {plans.length === 0 ? (
            <div className={styles.emptyState}>No hay planes disponibles en este momento.</div>
          ) : (
            plans.map((plan, i) => {
              const isPopular = i === 1 || plan.amount > 50000;
              return (
                <div key={plan.id} className={`${styles.planCard} ${isPopular ? styles.popularPlan : ''}`}>
                  {isPopular && <div className={styles.popularBadge}>MÁS ELEGIDO</div>}
                  <div className={styles.planHeader}>
                    <Star className={styles.planIcon} />
                    <h3>{plan.name}</h3>
                  </div>
                  
                  <div className={styles.planPrice}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>{parseInt(plan.amount).toLocaleString('es-CO')}</span>
                    <span className={styles.period}>/ {plan.interval === 'month' ? 'mes' : 'año'}</span>
                  </div>
                  
                  <p className={styles.planDescription}>{plan.description}</p>
                  
                  <div className={styles.planBenefits}>
                    {Array.isArray(plan.benefits) && plan.benefits.length > 0 ? (
                      plan.benefits.map((benefit: string, j: number) => (
                        <div key={j} className={styles.benefitItem}>
                          <CheckCircle2 className={styles.benefitIcon} size={16} />
                          <span>{benefit}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className={styles.benefitItem}>
                          <CheckCircle2 className={styles.benefitIcon} size={16} />
                          <span>Vehículo Destacado Premium</span>
                        </div>
                        <div className={styles.benefitItem}>
                          <CheckCircle2 className={styles.benefitIcon} size={16} />
                          <span>Posicionamiento en primera página</span>
                        </div>
                        <div className={styles.benefitItem}>
                          <CheckCircle2 className={styles.benefitIcon} size={16} />
                          <span>{plan.duration || 30} {plan.durationUnit || 'días'} de visibilidad</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button onClick={() => handleSelectPlan(plan)} className={styles.selectPlanBtn}>
                    Elegir este plan
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {step === "SELECT_VEHICLE" && selectedPlan && (
        <div className={styles.selectVehicleContainer}>
          <button className={styles.backBtn} onClick={() => setStep("SELECT_PLAN")}>
            &larr; Volver a planes
          </button>
          
          <div className={styles.stepHeader}>
            <h2>¿Qué vehículo deseas destacar?</h2>
            <p>Selecciona uno de tus vehículos activos para aplicar el plan <strong>{selectedPlan.name}</strong>.</p>
          </div>

          <div className={styles.vehiclesList}>
            {activeVehicles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tienes vehículos activos o todos ya están destacados.</p>
              </div>
            ) : (
              activeVehicles.map(v => (
                <div key={v.id} className={styles.vehicleSelectCard} onClick={() => handleSelectVehicle(v.id)}>
                  <div className={styles.vehicleSelectImgWrapper}>
                    <img src={v.image} alt={v.modelName} className={styles.vehicleSelectImg} />
                  </div>
                  <div className={styles.vehicleSelectInfo}>
                    <h4>{v.brandName} {v.modelName} {v.version}</h4>
                    <p>{v.year} • {v.mileage.toLocaleString()} KM • {v.city}</p>
                    <p className={styles.vehiclePrice}>${parseInt(v.price).toLocaleString('es-CO')}</p>
                  </div>
                  <div className={styles.selectChevron}>
                    <ChevronRight />
                  </div>
                </div>
              ))
            )}
            
            {featuredVehicles.length > 0 && (
              <div className={styles.featuredAlready}>
                <h4 style={{ color: '#888', margin: '2rem 0 1rem 0' }}>Vehículos que ya están destacados</h4>
                {featuredVehicles.map(v => (
                   <div key={v.id} className={`${styles.vehicleSelectCard} ${styles.disabled}`}>
                     <div className={styles.vehicleSelectImgWrapper}>
                       <img src={v.image} alt={v.modelName} className={styles.vehicleSelectImg} />
                     </div>
                     <div className={styles.vehicleSelectInfo}>
                       <h4>{v.brandName} {v.modelName} {v.version}</h4>
                       <p>{v.year} • {v.mileage.toLocaleString()} KM</p>
                     </div>
                     <div className={styles.selectChevron} style={{ color: 'var(--gold-accent)' }}>
                       <Star size={18} fill="currentColor" />
                     </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === "CHECKOUT" && selectedPlan && selectedVehicleId && (
        <div className={styles.checkoutContainer}>
          <button className={styles.backBtn} onClick={() => setStep("SELECT_VEHICLE")}>
            &larr; Cambiar vehículo
          </button>
          
          <div className={styles.checkoutBox}>
            <h2 className={styles.checkoutTitle}>Resumen de tu suscripción</h2>
            
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Plan Seleccionado</span>
                <span className={styles.summaryValue}>{selectedPlan.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Total a Pagar</span>
                <span className={styles.summaryValueAmount}>${parseInt(selectedPlan.amount).toLocaleString('es-CO')} <span className={styles.intervalText}>/ {selectedPlan.interval === 'month' ? 'mes' : 'año'}</span></span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Vehículo a Destacar</span>
                <span className={styles.summaryValue}>
                  {userVehicles.find(v => v.id === selectedVehicleId)?.brandName}{" "}
                  {userVehicles.find(v => v.id === selectedVehicleId)?.modelName}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Duración del Destacado</span>
                <span className={styles.summaryValue}>{selectedPlan.duration || 30} {selectedPlan.durationUnit || 'días'}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Renovación Automática</span>
                <span className={styles.summaryValue}>{selectedPlan.autoRenew ? 'Sí, cobro recurrente' : 'No, único pago'}</span>
              </div>
            </div>

            <div className={styles.disclaimer}>
              <p>Al hacer clic en "Continuar al Pago", serás redirigido a Wompi, nuestra pasarela de pagos segura. Si tu pago es aprobado, tu vehículo será destacado inmediatamente.</p>
            </div>

            <button 
              onClick={handleSubscribe} 
              disabled={processing}
              className={styles.payBtn}
            >
              {processing ? "Procesando de forma segura..." : "Continuar al Pago Seguro"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
