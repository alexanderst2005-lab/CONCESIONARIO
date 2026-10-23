import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const neonClient = neon(process.env.DATABASE_URL!);
const db = drizzle(neonClient);

async function makeAdmin() {
  const email = process.argv[2] || 'santanamateo352@gmail.com';
  try {
    const res: any = await db.execute(sql`UPDATE users SET role = 'ADMIN' WHERE email = ${email} RETURNING id, email, role`);
    if (res?.length > 0 || res?.rowCount > 0) {
      console.log(`✓ Rol actualizado a ADMIN para ${email}`);
    } else {
      console.log(`Aviso: No se encontró usuario con el correo ${email}. Inicia sesión primero y luego ejecuta este script.`);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

makeAdmin();
