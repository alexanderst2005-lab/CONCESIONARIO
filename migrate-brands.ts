import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const neonClient = neon(connectionString);
const db = drizzle(neonClient);

async function migrate() {
  console.log("Connecting to Neon DB...");
  
  try {
    await db.execute(sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT`);
    console.log("✓ Added logo_url column");

    await db.execute(sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`);
    console.log("✓ Added sort_order column");

    console.log("✓ Migration complete!");
  } catch (err: any) {
    console.error("Migration error:", err.message);
  }
}

migrate();
