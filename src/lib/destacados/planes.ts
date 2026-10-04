import 'server-only';
import { db } from '@/db';
import { planesDestacado } from '@/db/schema';
import { and, asc, eq } from 'drizzle-orm';

/**
 * Acceso a planes de destacado. ÚNICA fuente de precios/duraciones:
 * nunca confiar en un precio o duración que venga del navegador.
 */

export type PlanPublico = {
  id: number;
  nombre: string;
  duracionDias: number;
  precio: number;      // COP enteros
  precioPorDia: number; // COP enteros (redondeado)
};

// Límites de negocio para validación (además de los CHECK de la BD)
export const LIMITES_PLAN = {
  nombreMin: 2,
  nombreMax: 60,
  diasMin: 1,
  diasMax: 365,
  precioMin: 1000,       // Wompi no acepta montos ínfimos
  precioMax: 20_000_000,
} as const;

function aPublico(p: typeof planesDestacado.$inferSelect): PlanPublico {
  return {
    id: p.id,
    nombre: p.nombre,
    duracionDias: p.duracionDias,
    precio: p.precio,
    precioPorDia: Math.round(p.precio / p.duracionDias),
  };
}

/** Planes visibles para usuarios (solo activos), ordenados por precio. */
export async function obtenerPlanesActivos(): Promise<PlanPublico[]> {
  const rows = await db
    .select()
    .from(planesDestacado)
    .where(eq(planesDestacado.activo, true))
    .orderBy(asc(planesDestacado.precio));
  return rows.map(aPublico);
}

/**
 * Obtiene un plan ACTIVO por id. Devuelve null si el id es inválido,
 * no existe o está inactivo. Usar SIEMPRE esto al iniciar un pago.
 */
export async function obtenerPlanActivoPorId(idEntrada: unknown): Promise<PlanPublico | null> {
  const id = parseIdPositivo(idEntrada);
  if (id === null) return null;
  const [row] = await db
    .select()
    .from(planesDestacado)
    .where(and(eq(planesDestacado.id, id), eq(planesDestacado.activo, true)))
    .limit(1);
  return row ? aPublico(row) : null;
}

/** Convierte un valor externo en entero positivo seguro, o null. */
export function parseIdPositivo(v: unknown): number | null {
  const n = typeof v === 'string' && /^\d{1,9}$/.test(v) ? Number(v) : v;
  return typeof n === 'number' && Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** Valida datos de plan enviados por el admin. Devuelve errores legibles (sin detalles internos). */
export function validarDatosPlan(
  data: unknown,
  { parcial }: { parcial: boolean },
): { ok: true; valores: Partial<{ nombre: string; duracionDias: number; precio: number; activo: boolean }> }
  | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Datos inválidos' };
  const d = data as Record<string, unknown>;
  const valores: Partial<{ nombre: string; duracionDias: number; precio: number; activo: boolean }> = {};

  if (d.nombre !== undefined || !parcial) {
    if (typeof d.nombre !== 'string') return { ok: false, error: 'El nombre es obligatorio' };
    const nombre = d.nombre.trim().replace(/\s+/g, ' ');
    if (nombre.length < LIMITES_PLAN.nombreMin || nombre.length > LIMITES_PLAN.nombreMax)
      return { ok: false, error: `El nombre debe tener entre ${LIMITES_PLAN.nombreMin} y ${LIMITES_PLAN.nombreMax} caracteres` };
    valores.nombre = nombre;
  }

  if (d.duracionDias !== undefined || !parcial) {
    const dias = Number(d.duracionDias);
    if (!Number.isInteger(dias) || dias < LIMITES_PLAN.diasMin || dias > LIMITES_PLAN.diasMax)
      return { ok: false, error: `La duración debe ser un número entero entre ${LIMITES_PLAN.diasMin} y ${LIMITES_PLAN.diasMax} días` };
    valores.duracionDias = dias;
  }

  if (d.precio !== undefined || !parcial) {
    const precio = Number(d.precio);
    if (!Number.isInteger(precio) || precio < LIMITES_PLAN.precioMin || precio > LIMITES_PLAN.precioMax)
      return { ok: false, error: `El precio debe ser un entero entre $${LIMITES_PLAN.precioMin.toLocaleString('es-CO')} y $${LIMITES_PLAN.precioMax.toLocaleString('es-CO')}` };
    valores.precio = precio;
  }

  if (d.activo !== undefined) {
    if (typeof d.activo !== 'boolean') return { ok: false, error: 'Estado inválido' };
    valores.activo = d.activo;
  }

  return { ok: true, valores };
}
