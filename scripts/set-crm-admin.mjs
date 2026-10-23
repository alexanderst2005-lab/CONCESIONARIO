import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setAdmin() {
  const email = 'crmautoselpatron@gmail.com';
  const rawPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await sql`
    INSERT INTO users (name, last_name, email, password, phone, role)
    VALUES ('Admin', 'Patrón', ${email}, ${hashedPassword}, '3000000000', 'ADMIN')
    ON CONFLICT (email) 
    DO UPDATE SET role = 'ADMIN', password = ${hashedPassword};
  `;

  console.log("-----------------------------------------");
  console.log("¡ADMINISTRADOR CONFIGURADO CON ÉXITO!");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${rawPassword}`);
  console.log("Role:     ADMIN");
  console.log("-----------------------------------------");
}

setAdmin().catch(console.error);
