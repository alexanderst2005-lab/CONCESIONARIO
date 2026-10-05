import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';
import { desc, eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("=== PAGOS ===");
  const pagos = await db.select().from(schema.pagos).orderBy(desc(schema.pagos.creadoEn)).limit(3);
  console.log(pagos);

  console.log("=== DESTACADOS ===");
  const destacados = await db.select().from(schema.destacadosActivos).orderBy(desc(schema.destacadosActivos.creadoEn)).limit(3);
  console.log(destacados);

  console.log("=== EVENTOS WOMPI ===");
  const eventos = await db.select().from(schema.eventosPago).orderBy(desc(schema.eventosPago.creadoEn)).limit(3);
  console.log(eventos);
}
main().catch(console.error);
