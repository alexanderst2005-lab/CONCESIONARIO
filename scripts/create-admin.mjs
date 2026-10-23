import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createAdmin() {
  const email = 'santanamateo352@gmail.com';
  const rawPassword = 'AdminPatron2026*';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Crear o actualizar a ADMIN
  await sql`
    INSERT INTO users (name, last_name, email, password, phone, role)
    VALUES ('Mateo', 'Santana', ${email}, ${hashedPassword}, '3000000000', 'ADMIN')
    ON CONFLICT (email) 
    DO UPDATE SET role = 'ADMIN', password = ${hashedPassword};
  `;

  console.log("-----------------------------------------");
  console.log("¡ADMINISTRADOR CREADO CON ÉXITO!");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${rawPassword}`);
  console.log("Role:     ADMIN");
  console.log("-----------------------------------------");
}

createAdmin().catch(console.error);
