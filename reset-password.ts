import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const neonClient = neon(connectionString);
const db = drizzle(neonClient);

async function resetPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin1234*", salt);
    
    await db.execute(sql`UPDATE users SET password = ${hashedPassword} WHERE email = 'santanamateo352@gmail.com'`);
    console.log("Contraseña actualizada exitosamente.");
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

resetPassword();
