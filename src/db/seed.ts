import { db } from './index';
import { brands, categories, models, vehicles } from './schema';

async function main() {
  console.log("Iniciando carga de datos de prueba...");

  // 1. Crear Categorías
  const [catCarros] = await db.insert(categories).values([
    { name: 'Carros y camionetas', slug: 'carros-y-camionetas' },
    { name: 'Motos', slug: 'motos' },
  ]).returning();
  console.log("Categorías creadas");

  // 2. Crear Marcas
  const [mazda, toyota, chevrolet] = await db.insert(brands).values([
    { name: 'Mazda', slug: 'mazda' },
    { name: 'Toyota', slug: 'toyota' },
    { name: 'Chevrolet', slug: 'chevrolet' },
  ]).returning();
  console.log("Marcas creadas");

  // 3. Crear Modelos
  const [cx5, prado, onix] = await db.insert(models).values([
    { brandId: mazda.id, name: 'CX-5', slug: 'cx-5' },
    { brandId: toyota.id, name: 'Prado', slug: 'prado' },
    { brandId: chevrolet.id, name: 'Onix', slug: 'onix' },
  ]).returning();
  console.log("Modelos creados");

  console.log("¡Datos de prueba insertados con éxito!");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error al insertar datos:", e);
  process.exit(1);
});
