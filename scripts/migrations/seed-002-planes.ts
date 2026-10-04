/**
 * Seed idempotente de los planes de destacado.
 * - Si el plan (por nombre) ya existe, NO lo sobrescribe (respeta ediciones del admin).
 * Uso: npx tsx scripts/migrations/seed-002-planes.ts
 */
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// $5.000 COP por día, lineal (sin descuento por volumen — confirmado por negocio)
const PLANES = [
  { nombre: 'Básico', duracionDias: 5, precio: 25000 },
  { nombre: 'Intermedio', duracionDias: 15, precio: 75000 },
  { nombre: 'Premium', duracionDias: 30, precio: 150000 },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of PLANES) {
      const r = await client.query(
        `INSERT INTO planes_destacado (nombre, duracion_dias, precio, activo)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (nombre) DO NOTHING
         RETURNING id`,
        [p.nombre, p.duracionDias, p.precio],
      );
      console.log(r.rowCount ? `  ✓ Creado: ${p.nombre}` : `  · Ya existía: ${p.nombre} (sin cambios)`);
    }
    await client.query('COMMIT');
    const all = await client.query(
      `SELECT id, nombre, duracion_dias, precio, activo FROM planes_destacado ORDER BY precio`);
    console.table(all.rows);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
