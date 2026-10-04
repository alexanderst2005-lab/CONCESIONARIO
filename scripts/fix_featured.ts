import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { vehicles } from '../src/db/schema';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
  console.log("Conectando a Neon...");
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Limpiando destacados...");
  await db.update(vehicles).set({ isFeatured: false });
  console.log("¡Limpio!");
  process.exit(0);
}

run().catch(console.error);
