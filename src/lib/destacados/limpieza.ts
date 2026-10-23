import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Limpia y elimina de forma atómica los destacados expirados:
 * 1. BORRA el registro de `destacados_activos` cuando `termina_en < now()` para que no quede basura.
 * 2. Apaga `is_featured = false` en `vehicles` para que deje de aparecer como destacado.
 * 3. También limpia las suscripciones que ya cumplieron su ciclo.
 */
export async function sincronizarDestacadosExpirados() {
  try {
    // 1. Eliminar destacados activos cuyo tiempo ya terminó y apagar is_featured
    await db.execute(sql`
      WITH exp AS (
        DELETE FROM destacados_activos
        WHERE termina_en < now() OR estado = 'expirado'
        RETURNING vehiculo_id
      )
      UPDATE vehicles v
      SET is_featured = false
      WHERE id IN (SELECT vehiculo_id FROM exp)
        AND NOT EXISTS (
          SELECT 1 FROM destacados_activos da
          WHERE da.vehiculo_id = v.id 
            AND da.termina_en >= now()
        );
    `);

    // 2. Limpiar suscripciones canceladas que ya cumplieron su periodo
    await db.execute(sql`
      WITH exp_sub AS (
        DELETE FROM subscriptions
        WHERE status = 'expired' OR (status = 'canceled' AND current_period_end < now())
        RETURNING vehicle_id
      )
      UPDATE vehicles v
      SET is_featured = false
      WHERE id IN (SELECT vehicle_id FROM exp_sub WHERE vehicle_id IS NOT NULL)
        AND NOT EXISTS (
          SELECT 1 FROM destacados_activos da
          WHERE da.vehiculo_id = v.id 
            AND da.termina_en >= now()
        );
    `);
  } catch (error) {
    console.error("[sincronizarDestacadosExpirados] Error silencioso:", error);
  }
}
