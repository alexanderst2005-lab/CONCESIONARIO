import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const feats = [
    'Aire acondicionado', 'Vidrios eléctricos', 'Frenos ABS', 'Airbags',
    'Cámara de reversa', 'Sensores de parqueo', 'Pantalla táctil / Bluetooth',
    'Techo panorámico / Sunroof', 'Rines de lujo', 'Cojinería en cuero',
    'Alarma / Bloqueo central', 'Retrovisores eléctricos'
  ];

  for (const f of feats) {
    await sql`INSERT INTO features (name) VALUES (${f}) ON CONFLICT DO NOTHING`;
  }
  console.log('✓ Equipamiento / Features agregadas');

  const banks = [
    { name: 'Bancolombia', rate: '1.25', terms: [12, 24, 36, 48, 60, 72] },
    { name: 'Banco de Bogotá', rate: '1.30', terms: [12, 24, 36, 48, 60, 72] },
    { name: 'Davivienda', rate: '1.28', terms: [12, 24, 36, 48, 60, 72] },
    { name: 'BBVA', rate: '1.29', terms: [12, 24, 36, 48, 60, 72] }
  ];

  for (const b of banks) {
    await sql`INSERT INTO banks (name, rate, terms, is_active) VALUES (${b.name}, ${b.rate}, ${JSON.stringify(b.terms)}, true)`;
  }
  console.log('✓ Bancos para cotizador agregados');
}

main().catch(console.error);
