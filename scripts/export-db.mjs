// Exporta todas las tablas del schema public a backup/db-export.json
// Uso: node scripts/export-db.mjs   (lee DATABASE_URL de .env.local)
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const tablas = await sql`
  select table_name from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by table_name`;

const out = {};
for (const { table_name } of tablas) {
  const rows = await sql.query(`select * from "${table_name}"`);
  out[table_name] = rows;
  console.log(`${table_name}: ${rows.length} filas`);
}

fs.mkdirSync('backup', { recursive: true });
fs.writeFileSync('backup/db-export.json', JSON.stringify(out));
console.log('Listo: backup/db-export.json');
