const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function updateAdminCredentials() {
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    // New credentials
    const newEmail = 'admin@123';
    const newPassword = 'admin123';

    // Hash the new password with bcrypt (same as the app uses)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Find and update the admin user
    const result = await pool.query(
      `UPDATE users SET email = $1, password = $2 WHERE role = 'ADMIN' RETURNING id, email, name, role`,
      [newEmail, hashedPassword]
    );

    if (result.rows.length === 0) {
      // If no admin found, check existing users
      const allUsers = await pool.query(`SELECT id, email, name, role FROM users LIMIT 10`);
      console.log('No admin user found. Existing users:');
      console.log(allUsers.rows);
    } else {
      console.log('✅ Admin credentials updated successfully!');
      console.log('Updated admin users:');
      result.rows.forEach(row => {
        console.log(`  - ID: ${row.id} | Email: ${row.email} | Name: ${row.name} | Role: ${row.role}`);
      });
      console.log('\n📋 New credentials:');
      console.log(`  Email:    ${newEmail}`);
      console.log(`  Password: ${newPassword}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateAdminCredentials();
