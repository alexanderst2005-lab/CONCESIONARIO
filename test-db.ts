import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';

const sql = neon('postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require');
const db = drizzle(sql, { schema });

async function main() {
  try {
    const res = await db.insert(schema.users).values({
      name: 'Luzenys',
      lastName: '', // Simulating an empty last name from Google
      email: 'luzenys1233@gmail.com',
      password: 'testpassword123',
      role: 'USER',
    }).returning();
    console.log("Insert success:", res);
  } catch (err) {
    console.error("Insert failed:", err);
  }
}

main().catch(console.error);
