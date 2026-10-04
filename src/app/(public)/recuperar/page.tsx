"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al enviar el correo');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className={styles.title} style={{ fontSize: "1.8rem" }}>Recuperar Contraseña</h1>
          <p className={styles.subtitle} style={{ marginBottom: "0" }}>Te enviaremos un enlace seguro para restablecerla.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={56} color="#34A853" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>¡Correo enviado!</h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Si existe una cuenta asociada a <strong>{email}</strong>, hemos enviado las instrucciones para restablecer tu contraseña.
            </p>
            <div style={{ background: 'rgba(205, 164, 52, 0.12)', border: '1px solid #cda434', borderRadius: 8, padding: '1rem', marginBottom: '2rem', color: '#f3d675', lineHeight: 1.5, fontSize: '0.95rem' }}>
              <strong>¿No ves el correo?</strong> Revisa tu carpeta de <strong>spam o correo no deseado</strong>. Si está ahí, ábrelo y márcalo como <strong>&quot;No es spam&quot;</strong> para que el enlace funcione.
            </div>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', width: '100%', padding: '1rem' }}>
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div style={{ color: "#ef4444", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="ejemplo@correo.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/login" style={{ color: 'var(--gold-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
