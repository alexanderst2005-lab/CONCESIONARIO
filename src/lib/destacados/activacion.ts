import 'server-only';
import { db } from '@/db';
import { pagos, destacadosActivos, estadoPagoEnum, vehicles } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';

/**
 * Lógica transaccional para activar o extender un destacado (SECCIÓN 3 y 10).
 * DEBE ejecutarse con dbTx (neon-serverless) para permitir FOR UPDATE.
 */
export async function activarOExtenderDestacado(pagoId: string, transaccionWompiId: string, metodoPago?: string) {
  // 1. Obtener el pago
  const [pago] = await db.select().from(pagos).where(eq(pagos.id, pagoId)).limit(1);
  
  if (!pago) {
    throw new Error(`Pago no encontrado: ${pagoId}`);
  }

  // Si ya está aprobado, idempotencia exitosa
  if (pago.estado === 'aprobado') {
    return { yaEstabaAprobado: true, pago };
  }

  if (pago.tipo !== 'destacado' || !pago.planId || !pago.vehiculoId) {
    throw new Error(`El pago ${pagoId} no es válido para destacar vehículo`);
  }

  // 2. Marcar el pago como aprobado
  await db.update(pagos)
    .set({
      estado: 'aprobado',
      aprobadoEn: new Date(),
      actualizadoEn: new Date(),
      idTransaccionWompi: transaccionWompiId,
      metodoPago: metodoPago || null
    })
    .where(eq(pagos.id, pagoId));

  // 3. Lógica de extensión
  const [destacadoExistente] = await db.select({ terminaEn: destacadosActivos.terminaEn })
    .from(destacadosActivos)
    .where(
      and(
        eq(destacadosActivos.vehiculoId, pago.vehiculoId),
        sql`${destacadosActivos.terminaEn} > now()`
      )
    )
    .orderBy(sql`${destacadosActivos.terminaEn} DESC`)
    .limit(1);

  // Calcula la nueva fecha de terminación
  const duracionDias = pago.duracionDiasCompra || 30; // Fallback
  
  // Usamos db.execute para poder hacer la aritmética de fechas de forma segura
  try {
    const iniciaEnSql = destacadoExistente ? sql`${destacadoExistente.terminaEn}` : sql`now()`;
    
    await db.execute(
      sql`INSERT INTO destacados_activos (vehiculo_id, pago_id, plan_id, origen, inicia_en, termina_en)
          VALUES (
            ${pago.vehiculoId}, 
            ${pagoId}, 
            ${pago.planId}, 
            'pago',
            ${iniciaEnSql},
            ${iniciaEnSql} + (CAST(${duracionDias} AS integer) * interval '1 day')
          )`
    );
  } catch (error: any) {
    // Si viola la constraint UNIQUE (pagoId), significa que otra petición ya lo insertó
    if (error.code === '23505') {
      console.log('Ignorando inserción duplicada de destacado para pago', pagoId);
    } else {
      throw error;
    }
  }

  // 5. Sincronizar bandera en vehicles
  await db.update(vehicles).set({ isFeatured: true }).where(eq(vehicles.id, pago.vehiculoId));

  return { yaEstabaAprobado: false, pago };
}

/**
 * Rechaza un pago que falló en Wompi (transaccional).
 */
export async function rechazarPago(pagoId: string, transaccionWompiId: string) {
  const [pago] = await db.select({ estado: pagos.estado }).from(pagos).where(eq(pagos.id, pagoId)).limit(1);
  if (!pago || pago.estado !== 'pendiente') return;

  await db.update(pagos)
    .set({ estado: 'rechazado', idTransaccionWompi: transaccionWompiId, actualizadoEn: new Date() })
    .where(eq(pagos.id, pagoId));
}
