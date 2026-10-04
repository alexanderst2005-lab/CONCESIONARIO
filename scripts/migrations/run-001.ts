/**
 * Aplica la migración 001 (destacados) en UNA transacción y luego ejecuta
 * pruebas de integridad dentro de otra transacción que se revierte (ROLLBACK),
 * así no deja datos de prueba.
 *
 * Uso: npx tsx scripts/migrations/run-001.ts
 */
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function expectFail(client: any, label: string, q: string, params: unknown[] = []) {
  await client.query('SAVEPOINT sp');
  try {
    await client.query(q, params);
    await client.query('RELEASE SAVEPOINT sp');
    throw new Error(`❌ ${label}: la BD ACEPTÓ algo que debía rechazar`);
  } catch (e: any) {
    if (e.message?.startsWith('❌')) throw e;
    await client.query('ROLLBACK TO SAVEPOINT sp');
    console.log(`  ✓ ${label} → rechazado (${e.code})`);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const exists = await client.query(`SELECT to_regclass('public.pagos') AS t`);
    if (exists.rows[0].t) {
      console.log('ℹ️  La migración ya estaba aplicada (tabla pagos existe). Solo se ejecutan pruebas.');
    } else {
      const sql = readFileSync(join(__dirname, '001_destacados.sql'), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Migración 001 aplicada.');
    }

    // ── Pruebas de integridad (todo se revierte al final) ──
    console.log('\n🔎 Pruebas de integridad:');
    await client.query('BEGIN');
    const u = await client.query(`SELECT id FROM users ORDER BY id LIMIT 1`);
    const v = await client.query(`SELECT id FROM vehicles ORDER BY id LIMIT 1`);
    if (!u.rows[0] || !v.rows[0]) throw new Error('Se necesita al menos 1 usuario y 1 vehículo para probar');
    const userId = u.rows[0].id, vehId = v.rows[0].id;

    const plan = await client.query(
      `INSERT INTO planes_destacado (nombre, duracion_dias, precio) VALUES ('__test__', 5, 25000) RETURNING id`);
    const planId = plan.rows[0].id;

    await expectFail(client, 'Plan con precio 0', `INSERT INTO planes_destacado (nombre, duracion_dias, precio) VALUES ('__x__', 5, 0)`);
    await expectFail(client, 'Plan con 0 días', `INSERT INTO planes_destacado (nombre, duracion_dias, precio) VALUES ('__y__', 0, 100)`);

    const pago = await client.query(
      `INSERT INTO pagos (referencia_unica, usuario_id, vehiculo_id, plan_id, tipo, monto, duracion_dias_compra)
       VALUES ('__ref_test__', $1, $2, $3, 'destacado', 25000, 5) RETURNING id`, [userId, vehId, planId]);
    const pagoId = pago.rows[0].id;

    await expectFail(client, 'Referencia duplicada',
      `INSERT INTO pagos (referencia_unica, usuario_id, vehiculo_id, plan_id, tipo, monto, duracion_dias_compra)
       VALUES ('__ref_test__', $1, $2, $3, 'destacado', 25000, 5)`, [userId, vehId, planId]);
    await expectFail(client, 'Pago destacado sin plan',
      `INSERT INTO pagos (referencia_unica, usuario_id, tipo, monto) VALUES ('__r2__', $1, 'destacado', 25000)`, [userId]);
    await expectFail(client, 'Monto negativo',
      `INSERT INTO pagos (referencia_unica, usuario_id, plan_id, tipo, monto, duracion_dias_compra) VALUES ('__r3__', $1, $2, 'destacado', -1, 5)`, [userId, planId]);
    await expectFail(client, 'Estado inválido (enum)', `UPDATE pagos SET estado = 'hackeado' WHERE id = $1`, [pagoId]);
    await expectFail(client, 'Aprobado sin fecha', `UPDATE pagos SET estado = 'aprobado' WHERE id = $1`, [pagoId]);

    // Row lock disponible (requisito de la Fase 3)
    await client.query(`SELECT id FROM pagos WHERE id = $1 FOR UPDATE`, [pagoId]);
    console.log('  ✓ SELECT ... FOR UPDATE funciona (transacciones reales)');

    await client.query(
      `INSERT INTO destacados_activos (vehiculo_id, pago_id, plan_id, inicia_en, termina_en)
       VALUES ($1, $2, $3, now(), now() + interval '5 days')`, [vehId, pagoId, planId]);
    await expectFail(client, 'Mismo pago activando 2 veces (idempotencia BD)',
      `INSERT INTO destacados_activos (vehiculo_id, pago_id, plan_id, inicia_en, termina_en)
       VALUES ($1, $2, $3, now(), now() + interval '5 days')`, [vehId, pagoId, planId]);
    await expectFail(client, 'Destacado con fin antes del inicio',
      `INSERT INTO destacados_activos (vehiculo_id, origen, inicia_en, termina_en)
       VALUES ($1, 'cortesia_admin', now(), now() - interval '1 day')`, [vehId]);
    await expectFail(client, 'Destacado de origen pago sin pago',
      `INSERT INTO destacados_activos (vehiculo_id, origen, inicia_en, termina_en)
       VALUES ($1, 'pago', now(), now() + interval '1 day')`, [vehId]);

    await client.query('ROLLBACK');
    console.log('\n✅ Todas las pruebas pasaron. Datos de prueba revertidos.');
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
