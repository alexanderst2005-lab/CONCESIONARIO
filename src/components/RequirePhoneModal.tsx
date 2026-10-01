"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequirePhoneModal({ session }: { session: any }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user || session.user.role === "ADMIN" || session.user.phone) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      });

      if (res.ok) {
        // Force session refresh
        router.refresh();
        window.location.reload();
      } else {
        setError("Error al guardar el teléfono. Intenta nuevamente.");
      }
    } catch (e) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#111',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        border: '1px solid #cda434',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1.5rem', fontFamily: 'serif' }}>Completa tu registro</h2>
        <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
          Para continuar usando la plataforma y poder publicar vehículos o contactar vendedores, necesitamos tu número de teléfono / WhatsApp.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ccc' }}>Teléfono / WhatsApp</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 3001234567"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#000',
                border: '1px solid #333',
                color: '#fff',
                borderRadius: '4px',
                outline: 'none'
              }}
              required
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#cda434',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Guardando..." : "Guardar y Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
