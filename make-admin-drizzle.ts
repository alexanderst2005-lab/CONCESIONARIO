import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql, eq } from 'drizzle-orm';
import { users } from './src/db/schema';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const neonClient = neon(connectionString);
const db = drizzle(neonClient);

async function run() {
  await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, 'santanamateo352@gmail.com'));
  const res = await db.execute(sql`SELECT email, role FROM users`);
  console.log("Updated. Current users:");
  console.log(res.rows);
}
run();
