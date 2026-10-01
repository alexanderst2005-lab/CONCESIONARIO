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
        <div className={styles.authHeader}>
          <h1 className="serif-title">Recuperar Contraseña</h1>
          <p>Te enviaremos un enlace seguro para restablecerla.</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={64} color="#34A853" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>¡Correo enviado!</h3>
            <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: 1.5 }}>
              Si existe una cuenta asociada a <strong>{email}</strong>, hemos enviado las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o la carpeta de SPAM.
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', width: '100%' }}>
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form className={styles.authForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
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
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" style={{ color: '#cda434', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
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
