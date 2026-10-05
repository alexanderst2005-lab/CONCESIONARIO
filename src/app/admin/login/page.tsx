"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales de administrador inválidas.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000", fontFamily: "var(--font-manrope), sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "3rem 2rem", backgroundColor: "#080808", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "#111", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto", border: "1px solid rgba(245,198,11,0.3)" }}>
            <Lock size={28} color="var(--gold-accent)" />
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontFamily: "var(--font-playfair), serif", marginBottom: "0.5rem" }}>
            Autos del Patrón
          </h1>
          <p style={{ color: "var(--gold-accent)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
            Centro de Control
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ padding: "0.75rem", backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "6px", color: "#f87171", fontSize: "0.85rem", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: 600 }}>Correo Corporativo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "1rem", backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "1rem", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", fontWeight: 600 }}>Clave de Acceso</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "1rem", backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fff", fontSize: "1rem", outline: "none" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "1rem", backgroundColor: "var(--gold-accent)", color: "#000", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", marginTop: "1rem" }}
          >
            {loading ? "VERIFICANDO..." : "ACCEDER AL SISTEMA"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: "0.75rem" }}>
            Acceso restringido únicamente para personal autorizado.
          </p>
        </div>

      </div>
    </div>
  );
}
