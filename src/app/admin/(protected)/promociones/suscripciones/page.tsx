"use client";

import React, { useEffect, useState } from "react";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions/subscriptions");
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Suscripciones Activas</h1>
          <p style={{ color: "#aaa", margin: 0 }}>Monitoreo de pagos recurrentes y vehículos destacados.</p>
        </div>
      </div>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Cliente</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Vehículo</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Plan</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Próximo Cobro</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Pagos</th>
                <th style={{ padding: "1rem", textAlign: "right", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando suscripciones...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay suscripciones registradas.</td></tr>
              ) : (
                subscriptions.map(sub => {
                  const isActive = sub.status === 'active';
                  const isCanceled = sub.status === 'canceled';
                  const statusColor = isActive ? "#4ade80" : isCanceled ? "#f87171" : "#fbbf24";

                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "1rem" }}>
                        <p style={{ margin: 0, color: "#fff", fontWeight: 600 }}>{sub.user?.name} {sub.user?.lastName}</p>
                        <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>{sub.user?.email}</p>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <p style={{ margin: 0, color: "#fff" }}>{sub.vehicle?.brand?.name} {sub.vehicle?.model?.name}</p>
                        <p style={{ margin: 0, color: "var(--gold-accent)", fontSize: "0.8rem", fontWeight: "bold" }}>
                          {sub.vehicle?.isFeatured ? '⭐ DESTACADO' : 'NORMAL'}
                        </p>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <p style={{ margin: 0, color: "#fff" }}>{sub.plan?.name}</p>
                        <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>${sub.amount.toLocaleString('es-CO')} / {sub.plan?.interval}</p>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ 
                          padding: "0.25rem 0.5rem", 
                          borderRadius: "4px", 
                          fontSize: "0.75rem", 
                          fontWeight: 600,
                          backgroundColor: `${statusColor}20`,
                          color: statusColor
                        }}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#ccc" }}>
                        {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('es-CO') : '-'}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {sub.payments?.map((payment: any) => (
                            <div key={payment.id} style={{ fontSize: "0.75rem", color: payment.status === 'APPROVED' ? '#4ade80' : '#f87171' }}>
                              {payment.status}: ${payment.amount.toLocaleString('es-CO')}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <button 
                          onClick={() => {
                            if(window.confirm(`¿Seguro que deseas ${sub.vehicle?.isFeatured ? 'suspender' : 'reactivar'} el destacado de este vehículo por razones administrativas?`)) {
                              fetch(`/api/admin/promotions/subscriptions/${sub.id}`, { method: 'PUT' })
                                .then(res => {
                                  if (res.ok) {
                                    fetchSubscriptions();
                                  } else {
                                    alert('Error al cambiar el estado del destacado');
                                  }
                                });
                            }
                          }}
                          style={{
                            background: sub.vehicle?.isFeatured ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
                            color: sub.vehicle?.isFeatured ? "#f87171" : "#4ade80",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.4rem 0.75rem",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "bold"
                          }}
                        >
                          {sub.vehicle?.isFeatured ? 'Suspender Destacado' : 'Reactivar Destacado'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
