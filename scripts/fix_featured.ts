import { db } from "../src/db";
import { vehicles } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Des-destacando todos los vehículos en la base de datos...");
  await db.update(vehicles).set({ isFeatured: false });
  console.log("¡Listo! Todos los vehículos ahora son normales.");
  process.exit(0);
}

run().catch(console.error);
