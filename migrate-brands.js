const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_VmXMIP6hYU2N@ep-round-bonus-b4fl69lk-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
});

async function migrate() {
  await client.connect();
  console.log("Connected to Neon DB");

  try {
    // Add logo_url column if it doesn't exist
    await client.query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS logo_url TEXT;
    `);
    console.log("✓ Added logo_url column");

    // Add sort_order column if it doesn't exist
    await client.query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
    `);
    console.log("✓ Added sort_order column");

    console.log("✓ Migration complete!");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
