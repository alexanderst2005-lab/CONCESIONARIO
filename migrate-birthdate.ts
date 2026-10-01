import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const neonClient = neon(connectionString);
const db = drizzle(neonClient);

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date TIMESTAMP`);
    console.log("Migration successful");
  } catch (err: any) {
    console.error("Migration failed:", err.message);
  }
}
migrate();
