"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useUI } from "@/components/UIProvider";

export default function ProfileForm({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { toast } = useUI();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast("Perfil actualizado correctamente", "success");
      } else {
        toast("Error al actualizar el perfil", "error");
      }
    } catch (e) {
      toast("Error de conexión", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast("Las nuevas contraseñas no coinciden", "warning");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (res.ok) {
        toast("Contraseña actualizada exitosamente", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast(data.message || "Error al actualizar la contraseña", "error");
      }
    } catch (e) {
      toast("Error de conexión", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitleWrapper}>
          <h1 className="serif-title">Mi Perfil</h1>
          <p>Actualiza tu información personal y contraseña.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "600px" }}>
        
        {/* Formulario de Datos Personales */}
        <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "8px", border: "1px solid #222" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#fff", marginBottom: "1.5rem" }}>Datos Personales</h2>
          <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Nombre</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Apellido</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Correo Electrónico (No editable)</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                style={{ width: "100%", padding: "0.85rem", backgroundColor: "#050505", border: "1px solid #222", borderRadius: "4px", color: "#555", cursor: "not-allowed" }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Teléfono</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff", colorScheme: "dark" }}
                />
              </div>
            </div>

            <button type="submit" disabled={savingProfile} style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--gold-accent)", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", color: "#000" }}>
              {savingProfile ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
        </div>

        {/* Formulario de Contraseña */}
        <div style={{ backgroundColor: "#111", padding: "2rem", borderRadius: "8px", border: "1px solid #222" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#fff", marginBottom: "1.5rem" }}>Cambiar Contraseña</h2>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Contraseña Actual</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                required
              />
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Confirmar Nueva</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  style={{ width: "100%", padding: "0.85rem", backgroundColor: "#000", border: "1px solid #333", borderRadius: "4px", color: "#fff" }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={savingPassword} style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
              {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
