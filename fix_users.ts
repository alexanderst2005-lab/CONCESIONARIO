import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon("postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(sql);

async function fixUsers() {
  // 1. Restaurar el usuario normal (ID 1)
  const oldPassword = await bcrypt.hash('password123', 12); // No sabemos la clave anterior, ponemos una temporal
  await db.update(users)
    .set({ 
      email: 'santanamateo352@gmail.com', 
      role: 'USER'
    })
    .where(eq(users.id, 1));
  console.log('✅ Usuario normal restaurado (santanamateo352@gmail.com)');

  // 2. Crear un usuario ADMINISTRADOR independiente
  const adminEmail = 'admin@123';
  const adminPassword = 'admin123';
  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);

  // Verificar si ya existe para no duplicar
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail));
  
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      name: 'Administrador',
      lastName: 'Principal',
      email: adminEmail,
      password: adminHashedPassword,
      phone: '0000000000',
      role: 'ADMIN'
    });
    console.log('✅ Usuario ADMINISTRADOR independiente creado correctamente');
  } else {
    console.log('⚠️ El usuario administrador ya existía');
  }
}

fixUsers().catch(console.error);
