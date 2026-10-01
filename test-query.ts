import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql, eq } from 'drizzle-orm';
import * as schema from './src/db/schema';
import { vehicles } from './src/db/schema';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const neonClient = neon(connectionString);
const db = drizzle(neonClient, { schema });

async function run() {
  try {
    const vehicleRecord = await db.query.vehicles.findFirst({
      with: {
        brand: true,
        model: true,
        user: true,
        images: true,
        features: {
          with: {
            feature: true
          }
        }
      }
    });
    console.log(vehicleRecord);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
}
run();
