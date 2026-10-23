import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Limpia y sincroniza con precisión al segundo todos los destacados y suscripciones que hayan expirado.
 * 
 * Acciones:
 * 1. Pone estado = 'expirado' en `destacados_activos` cuando `termina_en < now()`.
 * 2. Apaga `is_featured = false` en `vehicles` para los vehículos cuyo tiempo terminó.
 * 3. Actualiza el estado en `subscriptions` a 'expired' cuando `current_period_end < now()`.
 * 
 * Es ultra-rápido (ejecución atómica en PostgreSQL) y seguro contra errores.
 */
export async function sincronizarDestacadosExpirados() {
  try {
    // 1. Sincronizar destacados activos individuales
    await db.execute(sql`
      WITH exp AS (
        UPDATE destacados_activos
        SET estado = 'expirado'
        WHERE termina_en < now() AND estado != 'expirado'
        RETURNING vehiculo_id
      )
      UPDATE vehicles v
      SET is_featured = false
      WHERE id IN (SELECT vehiculo_id FROM exp)
        AND NOT EXISTS (
          SELECT 1 FROM destacados_activos da
          WHERE da.vehiculo_id = v.id 
            AND da.termina_en >= now() 
            AND da.estado = 'activo'
        );
    `);

    // 2. Sincronizar suscripciones recurrentes canceladas que hayan expirado
    await db.execute(sql`
      WITH exp_sub AS (
        UPDATE subscriptions
        SET status = 'expired'
        WHERE status = 'canceled' AND current_period_end < now()
        RETURNING vehicle_id
      )
      UPDATE vehicles v
      SET is_featured = false
      WHERE id IN (SELECT vehicle_id FROM exp_sub WHERE vehicle_id IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1 FROM destacados_activos da
          WHERE da.vehiculo_id = v.id 
            AND da.termina_en >= now() 
            AND da.estado = 'activo'
        );
    `);
  } catch (error) {
    console.error("[sincronizarDestacadosExpirados] Error silencioso:", error);
  }
}
