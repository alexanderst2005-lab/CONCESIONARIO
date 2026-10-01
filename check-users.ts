import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const neonClient = neon(connectionString);
const db = drizzle(neonClient);

async function checkUsers() {
  try {
    const result = await db.execute(sql`SELECT id, name, email, role FROM users`);
    console.log("Usuarios en la DB:");
    console.table(result.rows);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

checkUsers();
