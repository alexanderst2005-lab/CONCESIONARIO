"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, CheckCircle2 } from 'lucide-react';
import styles from '../login/page.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Enlace de recuperación inválido o inexistente.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al restablecer contraseña');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) return null;

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className={styles.title} style={{ fontSize: "1.8rem" }}>Nueva Contraseña</h1>
          <p className={styles.subtitle} style={{ marginBottom: "0" }}>Crea una nueva contraseña para tu cuenta.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={56} color="#34A853" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>¡Contraseña actualizada!</h3>
            <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: 1.5 }}>
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', width: '100%', padding: '1rem' }}>
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div style={{ color: "#ef4444", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="password">Nueva Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder="••••••••" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token}
              />
            </div>

            {token && (
              <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
