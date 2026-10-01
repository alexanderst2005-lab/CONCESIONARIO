import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon("postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(sql);

async function setupAdmin() {
  const newEmail = 'admin@123';
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update the existing user to be ADMIN with new credentials
  const result = await db.update(users)
    .set({ 
      email: newEmail, 
      password: hashedPassword,
      role: 'ADMIN'
    })
    .where(eq(users.id, 1))
    .returning({ id: users.id, email: users.email, role: users.role, name: users.name });

  if (result.length > 0) {
    console.log('✅ Admin user configured successfully!');
    console.log(`   ID: ${result[0].id} | Name: ${result[0].name} | Role: ${result[0].role}`);
    console.log('\n🔑 New credentials to use at /admin/login:');
    console.log(`   Email:    ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
  } else {
    console.log('❌ Could not find user with ID 1');
  }
}

setupAdmin().catch(console.error);
