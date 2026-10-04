import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

/**
 * Cliente de BD CON soporte de transacciones interactivas y row locks
 * (SELECT ... FOR UPDATE).
 *
 * El cliente principal (`db` en ./index.ts) usa neon-http, que NO soporta
 * transacciones. Este cliente se usa EXCLUSIVAMENTE para operaciones de dinero
 * (activar/extender destacados, cambiar estado de pagos), donde la atomicidad
 * y el bloqueo de fila son obligatorios.
 *
 * Requiere Node >= 22 (WebSocket global) en el runtime de Node.js.
 */
const globalForPool = globalThis as unknown as { __pagosPool?: Pool };

const pool =
  globalForPool.__pagosPool ??
  new Pool({ connectionString: process.env.DATABASE_URL!, max: 5 });

if (process.env.NODE_ENV !== 'production') globalForPool.__pagosPool = pool;

export const dbTx = drizzle(pool, { schema });
