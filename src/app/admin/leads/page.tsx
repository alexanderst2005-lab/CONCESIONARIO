"use client";

import React, { useEffect, useState } from "react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const changeStatus = async (id: number, status: string) => {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchLeads();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Nuevo': return { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' };
      case 'Contactado': return { bg: 'rgba(245,198,11,0.2)', color: 'var(--gold-accent)' };
      case 'En seguimiento': return { bg: 'rgba(168,85,247,0.2)', color: '#a855f7' };
      case 'Cerrado': return { bg: 'rgba(74,222,128,0.2)', color: '#4ade80' };
      default: return { bg: '#222', color: '#aaa' };
    }
  };

  return (
    <div>
      <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff", marginBottom: "2rem" }}>Leads / Interesados</h1>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Interesado</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Vehículo</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Vendedor</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando interesados...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay interesados registrados.</td></tr>
              ) : (
                leads.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "1rem" }}>
                      <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{l.name}</p>
                      <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>{l.phone} {l.email ? `· ${l.email}` : ''}</p>
                      <p style={{ color: "#666", fontSize: "0.75rem", margin: 0 }}>{new Date(l.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td style={{ padding: "1rem", color: "#ccc", fontWeight: 500 }}>
                      {l.vehicleBrand} {l.vehicleModel}
                    </td>
                    <td style={{ padding: "1rem", color: "#aaa" }}>{l.sellerName}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: getStatusColor(l.status).bg, color: getStatusColor(l.status).color }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select 
                        value={l.status}
                        onChange={(e) => changeStatus(l.id, e.target.value)}
                        style={{ padding: "0.4rem", background: "#050505", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", outline: "none", fontSize: "0.8rem" }}
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="Contactado">Contactado</option>
                        <option value="En seguimiento">En seguimiento</option>
                        <option value="Cerrado">Cerrado</option>
                      </select>
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
