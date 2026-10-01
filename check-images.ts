import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/db/schema';
import { desc } from 'drizzle-orm';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const neonClient = neon(connectionString);
const db = drizzle(neonClient, { schema });

async function run() {
  const latestVehicles = await db.query.vehicles.findMany({
    orderBy: [desc(schema.vehicles.id)],
    limit: 1,
    with: { images: true }
  });
  console.log(JSON.stringify(latestVehicles, null, 2));
}
run();
