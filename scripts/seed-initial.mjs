import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Insertando categorías iniciales...");
  
  const categoriesData = [
    { name: 'Carros y camionetas', slug: 'carros-y-camionetas', subtypes: '["Sedán", "Hatchback", "Camioneta / SUV", "Pick Up", "Coupé"]' },
    { name: 'Motos', slug: 'motos', subtypes: '["Scooter", "Enduro", "Deportiva", "Touring", "Urbana"]' },
    { name: 'Camiones y comerciales', slug: 'camiones-y-comerciales', subtypes: '["Furgón", "Volqueta", "Camión liviano", "Chasis"]' }
  ];

  for (const cat of categoriesData) {
    await sql`
      INSERT INTO categories (name, slug, is_active, subtypes, brands_list)
      VALUES (${cat.name}, ${cat.slug}, true, ${cat.subtypes}, '[]')
      ON CONFLICT (slug) DO NOTHING;
    `;
  }
  console.log("✓ Categorías creadas");

  console.log("Insertando marcas principales...");
  const marcas = [
    { name: 'Toyota', slug: 'toyota', sort: 1 },
    { name: 'Chevrolet', slug: 'chevrolet', sort: 2 },
    { name: 'Renault', slug: 'renault', sort: 3 },
    { name: 'Mazda', slug: 'mazda', sort: 4 },
    { name: 'Kia', slug: 'kia', sort: 5 },
    { name: 'Nissan', slug: 'nissan', sort: 6 },
    { name: 'Ford', slug: 'ford', sort: 7 },
    { name: 'Hyundai', slug: 'hyundai', sort: 8 },
    { name: 'Volkswagen', slug: 'volkswagen', sort: 9 },
    { name: 'Suzuki', slug: 'suzuki', sort: 10 },
    { name: 'BMW', slug: 'bmw', sort: 11 },
    { name: 'Mercedes-Benz', slug: 'mercedes-benz', sort: 12 },
    { name: 'Yamaha', slug: 'yamaha', sort: 13 },
    { name: 'Bajaj', slug: 'bajaj', sort: 14 }
  ];

  for (const m of marcas) {
    await sql`
      INSERT INTO brands (name, slug, sort_order, is_active)
      VALUES (${m.name}, ${m.slug}, ${m.sort}, true)
      ON CONFLICT (slug) DO NOTHING;
    `;
  }
  console.log("✓ Marcas creadas");

  console.log("¡Inicialización de base de datos exitosa!");
}

seed().catch(console.error);
