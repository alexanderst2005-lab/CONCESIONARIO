"use client";

import React, { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsersList(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
    
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    fetchUsers();
  };

  return (
    <div>
      <h1 className="serif-title" style={{ fontSize: "2rem", color: "#fff", marginBottom: "2rem" }}>Usuarios Registrados</h1>

      <div style={{ background: "#080808", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Nombre</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Teléfono</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Rol</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Registro</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#888", fontSize: "0.8rem", textTransform: "uppercase" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Cargando usuarios...</td></tr>
              ) : usersList.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>No hay usuarios registrados.</td></tr>
              ) : (
                usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "1rem", color: "#fff", fontWeight: 600 }}>{u.name} {u.lastName}</td>
                    <td style={{ padding: "1rem", color: "#ccc" }}>{u.email}</td>
                    <td style={{ padding: "1rem", color: "#ccc" }}>{u.phone || 'N/A'}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", backgroundColor: u.role === 'ADMIN' ? 'rgba(245,198,11,0.2)' : '#111', color: u.role === 'ADMIN' ? 'var(--gold-accent)' : '#aaa' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "#888", fontSize: "0.9rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem" }}>
                      <button onClick={() => changeRole(u.id, u.role)} style={{ padding: "0.4rem 0.75rem", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                        Cambiar a {u.role === "ADMIN" ? "USER" : "ADMIN"}
                      </button>
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
