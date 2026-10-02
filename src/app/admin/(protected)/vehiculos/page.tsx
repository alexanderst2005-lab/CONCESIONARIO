"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

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
        <a href="/publicar" className="btn-primary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none', alignItems: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Publicar Vehículo
        </a>
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
                          {v.images && v.images.length > 0 ? (
                            <img src={v.images[0].url} alt="vehiculo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", backgroundColor: "#222" }} />
                          )}
                        </div>
                        <div>
                          <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{v.brandName} {v.modelName} {v.version}</p>
                          <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>{v.year} · {v.city}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", color: "#ccc" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
                        <span>{v.userName} {v.userLastName}</span>
                        <button 
                          onClick={() => setSelectedVehicle(v)} 
                          style={{ padding: "0.25rem 0.5rem", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                        >
                          Ver Vendedor
                        </button>
                      </div>
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
      
      {/* VENDEDOR MODAL */}
      {selectedVehicle && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid var(--gold-accent)" }}>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem" }}>PROPIETARIO / VENDEDOR</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "#ccc" }}>
              <p><strong>Vehículo:</strong> {selectedVehicle.brandName} {selectedVehicle.modelName} {selectedVehicle.version} ({selectedVehicle.year})</p>
              <p><strong>Publicado el:</strong> {new Date(selectedVehicle.createdAt).toLocaleDateString('es-CO')}</p>
              <hr style={{ borderColor: "#333", margin: "0.5rem 0" }} />
              <p><strong>Nombre:</strong> {selectedVehicle.userName} {selectedVehicle.userLastName}</p>
              <p><strong>Correo:</strong> {selectedVehicle.userEmail}</p>
              <p><strong>Tel./WhatsApp:</strong> {selectedVehicle.userPhone || "No registrado"}</p>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedVehicle(null)} style={{ padding: "0.75rem 1.5rem", background: "transparent", color: "#fff", border: "1px solid #555", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cerrar</button>
              
              {selectedVehicle.userPhone && (
                <a 
                  href={`https://wa.me/${selectedVehicle.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${selectedVehicle.userName}, soy del equipo de Autos del Patrón. Tenemos un interesado en tu ${selectedVehicle.brandName} ${selectedVehicle.modelName} ${selectedVehicle.year} publicado en nuestra plataforma. Queremos comunicarnos contigo para darte seguimiento.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: "8px", fontWeight: 600 }}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.005-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Contactar Vendedor
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
