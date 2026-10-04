"use client";

import React, { useState, useEffect } from "react";
import { FileText, Eye, Download } from "lucide-react";
import { useUI } from "@/components/UIProvider";

export default function SolicitudesCreditoPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // En una fase posterior integraremos el fetch real a /api/financing-requests
  useEffect(() => {
    // Simulando carga inicial
    setTimeout(() => {
      setRequests([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div style={{ padding: "2rem", color: "#fff", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={28} color="#cda434" /> Solicitudes de Crédito
          </h1>
          <p style={{ color: "#aaa", marginTop: "0.5rem" }}>Aquí aparecerán las solicitudes enviadas por los clientes.</p>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "rgba(255,255,255,0.05)" }}>
            <tr>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>N° Solicitud</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Cliente</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Vehículo</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Entidad</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal" }}>Estado</th>
              <th style={{ padding: "1rem", color: "#aaa", fontWeight: "normal", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Cargando solicitudes...</td></tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "4rem 2rem", textAlign: "center", color: "#aaa" }}>
                  <FileText size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: "1rem", display: "inline-block" }} />
                  <p>Aún no hay solicitudes de crédito registradas.</p>
                  <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Aparecerán aquí cuando un cliente complete el formulario de financiación.</p>
                </td>
              </tr>
            ) : (
              // Aquí iteraremos sobre las solicitudes reales
              null
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
