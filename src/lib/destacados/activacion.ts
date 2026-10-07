import 'server-only';
import { dbTx } from '@/db/tx';
import { pagos, destacadosActivos, estadoPagoEnum } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Lógica transaccional para activar o extender un destacado (SECCIÓN 3 y 10).
 * DEBE ejecutarse con dbTx (neon-serverless) para permitir FOR UPDATE.
 */
export async function activarOExtenderDestacado(pagoId: string, transaccionWompiId: string, metodoPago?: string) {
  // Transacción interactiva serializable
  return await dbTx.transaction(async (tx) => {
    // 1. Bloquear la fila del pago para evitar race conditions (Sección 10-E)
    const resultPago = await tx.execute(
      sql`SELECT id, vehiculo_id, plan_id, tipo, estado, duracion_dias_compra, monto
          FROM pagos 
          WHERE id = ${pagoId} 
          FOR UPDATE` // ROW LOCK
    );
    
    if (resultPago.rows.length === 0) {
      throw new Error(`Pago no encontrado: ${pagoId}`);
    }
    
    const pago = resultPago.rows[0];

    // Si ya está aprobado, idempotencia exitosa (Sección 10-D)
    if (pago.estado === 'aprobado') {
      return { yaEstabaAprobado: true, pago };
    }

    if (pago.tipo !== 'destacado' || !pago.plan_id || !pago.vehiculo_id) {
      throw new Error(`El pago ${pagoId} no es válido para destacar vehículo`);
    }

    // 2. Marcar el pago como aprobado
    await tx.execute(
      sql`UPDATE pagos 
          SET estado = 'aprobado', 
              aprobado_en = now(), 
              actualizado_en = now(),
              id_transaccion_wompi = ${transaccionWompiId},
              metodo_pago = ${metodoPago || null}
          WHERE id = ${pagoId}`
    );

    // 3. Lógica de extensión (Sección 3: Fechas y plazos)
    // Buscamos si el vehículo YA tiene un destacado activo y obtenemos el mayor termina_en
    const resultDestacadoExistente = await tx.execute(
      sql`SELECT termina_en 
          FROM destacados_activos 
          WHERE vehiculo_id = ${pago.vehiculo_id} AND termina_en > now()
          ORDER BY termina_en DESC 
          LIMIT 1`
    );

    let iniciaEnSql = sql`now()`;
    if (resultDestacadoExistente.rows.length > 0) {
      // Tiene un periodo activo, iniciamos el nuevo al terminar el anterior
      iniciaEnSql = sql`${resultDestacadoExistente.rows[0].termina_en}`;
    }

    // 4. Crear el periodo de destacado
    await tx.execute(
      sql`INSERT INTO destacados_activos (vehiculo_id, pago_id, plan_id, origen, inicia_en, termina_en)
          VALUES (
            ${pago.vehiculo_id}, 
            ${pagoId}, 
            ${pago.plan_id}, 
            'pago',
            ${iniciaEnSql},
            ${iniciaEnSql} + (CAST(${pago.duracion_dias_compra} AS integer) * interval '1 day')
          )`
    );

    // 5. Sincronizar la bandera de la tabla vehicles para el catálogo (caché rápido)
    await tx.execute(
      sql`UPDATE vehicles SET is_featured = true WHERE id = ${pago.vehiculo_id}`
    );

    return { yaEstabaAprobado: false, pago };
  });
}

/**
 * Rechaza un pago que falló en Wompi (transaccional).
 */
export async function rechazarPago(pagoId: string, transaccionWompiId: string) {
  return await dbTx.transaction(async (tx) => {
    const resultPago = await tx.execute(
      sql`SELECT estado FROM pagos WHERE id = ${pagoId} FOR UPDATE`
    );
    
    if (resultPago.rows.length === 0) return;
    const pago = resultPago.rows[0];
    
    if (pago.estado !== 'pendiente') return; // Si ya fue aprobado, no podemos rechazarlo.
    
    await tx.execute(
      sql`UPDATE pagos 
          SET estado = 'rechazado', 
              actualizado_en = now(),
              id_transaccion_wompi = ${transaccionWompiId}
          WHERE id = ${pagoId}`
    );
  });
}
