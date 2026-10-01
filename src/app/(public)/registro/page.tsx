"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
        router.push("/login");
      } else {
        setError(result.message || "Ocurrió un error");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Crea tu Cuenta</h1>
        <p className={styles.subtitle}>Únete a la mejor plataforma automotriz</p>

        {error && <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nombre completo</label>
            <input type="text" id="name" name="name" placeholder="Juan Pérez" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" placeholder="tu@correo.com" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="city">Ciudad</label>
            <input type="text" id="city" name="city" placeholder="Bogotá, Cali, Medellín..." required />
          </div>

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
