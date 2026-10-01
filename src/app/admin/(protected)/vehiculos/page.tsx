"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    // Asumimos que crearemos un API general para listar todo en admin
    const res = await fetch("/api/admin/vehicles");
    const data = await res.json();
    setVehicles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const changeStatus = async (id: number, status: string) => {
    if (!confirm(`¿Cambiar estado a ${status}?`)) return;
    
    await fetch("/api/admin/vehicles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    
    fetchVehicles();
  };

  const deleteVehicle = async (id: number) => {
    if (!confirm("¿Eliminar este vehículo permanentemente?")) return;
    
    await fetch(`/api/admin/vehicles?id=${id}`, {
      method: "DELETE",
    });
    
    fetchVehicles();
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDIENTE': return { bg: 'rgba(245,198,11,0.2)', color: 'var(--gold-accent)' };
      case 'ACTIVO': 
      case 'APPROVED': return { bg: 'rgba(74,222,128,0.2)', color: '#4ade80' };
      case 'VENDIDO': return { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' };
      case 'RECHAZADO': return { bg: 'rgba(248,113,113,0.2)', color: '#f87171' };
      default: return { bg: '#222', color: '#aaa' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff" }}>Gestión de Vehículos</h1>
      </div>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Vehículo</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Vendedor</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Precio</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando vehículos...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay vehículos registrados.</td></tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "60px", height: "40px", backgroundColor: "#111", borderRadius: "4px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                          {/* Asumimos logo o imagen principal, por ahora cuadro gris */}
                        </div>
                        <div>
                          <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{v.brandName} {v.modelName} {v.version}</p>
                          <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>{v.year} · {v.city}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", color: "#ccc" }}>
                      {v.userName} {v.userLastName}
                    </td>
                    <td style={{ padding: "1rem", color: "var(--gold-accent)", fontWeight: 600 }}>
                      ${v.price?.toLocaleString('es-CO')}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px", 
                        fontSize: "0.75rem", 
                        fontWeight: 600,
                        backgroundColor: getStatusColor(v.status).bg,
                        color: getStatusColor(v.status).color
                      }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {v.status === "PENDIENTE" && (
                          <>
                            <button onClick={() => changeStatus(v.id, "ACTIVO")} style={{ padding: "0.4rem 0.75rem", background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Aprobar</button>
                            <button onClick={() => changeStatus(v.id, "RECHAZADO")} style={{ padding: "0.4rem 0.75rem", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Rechazar</button>
                          </>
                        )}
                        {(v.status === "ACTIVO" || v.status === "approved") && (
                          <>
                            <button onClick={() => changeStatus(v.id, "VENDIDO")} style={{ padding: "0.4rem 0.75rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Marcar Vendido</button>
                            <button onClick={() => changeStatus(v.id, "PAUSADO")} style={{ padding: "0.4rem 0.75rem", background: "rgba(255,255,255,0.1)", color: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Pausar</button>
                            <button onClick={async () => {
                              await fetch("/api/admin/vehicles/feature", { method: "PATCH", body: JSON.stringify({ id: v.id, isFeatured: !v.isFeatured }) });
                              fetchVehicles();
                            }} style={{ padding: "0.4rem 0.75rem", background: v.isFeatured ? "rgba(245,198,11,0.2)" : "transparent", color: "var(--gold-accent)", border: "1px solid var(--gold-accent)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                              {v.isFeatured ? "★ Destacado" : "☆ Destacar"}
                            </button>
                          </>
                        )}
                        {(v.status === "PAUSADO" || v.status === "RECHAZADO") && (
                          <button onClick={() => changeStatus(v.id, "ACTIVO")} style={{ padding: "0.4rem 0.75rem", background: "rgba(245,198,11,0.1)", color: "var(--gold-accent)", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Reactivar</button>
                        )}
                        <button onClick={() => deleteVehicle(v.id)} style={{ padding: "0.4rem 0.75rem", background: "transparent", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
