const fs = require('fs');

// --- UPDATE VEHICULOS PAGE ---
let vehiculosContent = fs.readFileSync('src/app/(public)/vehiculos/page.tsx', 'utf8');

const newVehiculosQuery = `
  const vehiclesRaw = await db.query.vehicles.findMany({
    where: and(...conditions),
    orderBy: [desc(vehicles.createdAt)],
    with: {
      brand: true,
      model: true,
      category: true,
      images: true,
    }
  });

  const vehiclesData = vehiclesRaw.map(v => ({
    id: v.id,
    slug: v.slug,
    version: v.version,
    year: v.year,
    mileage: v.mileage,
    price: v.price,
    city: v.city,
    fuelType: v.fuelType,
    transmission: v.transmission,
    brandName: v.brand?.name || "Desconocido",
    modelName: v.model?.name || "Desconocido",
    categoryName: v.category?.name || "Categoría",
    isFeatured: v.isFeatured,
    isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
  }));
`;

vehiculosContent = vehiculosContent.replace(/const vehiclesData = await db[\s\S]*?\.orderBy\(desc\(vehicles\.createdAt\)\);/, newVehiculosQuery);
fs.writeFileSync('src/app/(public)/vehiculos/page.tsx', vehiculosContent, 'utf8');

// --- UPDATE HOME PAGE ---
let homeContent = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');

const newHomeQueries = `
  const featuredRaw = await db.query.vehicles.findMany({
    where: and(eq(vehiclesTable.status, "ACTIVO"), eq(vehiclesTable.isFeatured, true)),
    orderBy: [desc(vehiclesTable.createdAt)],
    limit: 4,
    with: { brand: true, model: true, images: true }
  });

  const featuredVehicles = featuredRaw.map(v => ({
    id: v.id, slug: v.slug, year: v.year, mileage: v.mileage, price: v.price, city: v.city, fuelType: v.fuelType, transmission: v.transmission,
    brandName: v.brand?.name, modelName: v.model?.name, isFeatured: v.isFeatured, isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : undefined
  }));

  const recentRaw = await db.query.vehicles.findMany({
    where: eq(vehiclesTable.status, "ACTIVO"),
    orderBy: [desc(vehiclesTable.createdAt)],
    limit: 8,
    with: { brand: true, model: true, images: true }
  });

  const recentVehicles = recentRaw.map(v => ({
    id: v.id, slug: v.slug, year: v.year, mileage: v.mileage, price: v.price, city: v.city, fuelType: v.fuelType, transmission: v.transmission,
    brandName: v.brand?.name, modelName: v.model?.name, isFeatured: v.isFeatured, isDealerVehicle: v.isDealerVehicle,
    image: v.images && v.images.length > 0 ? v.images[0].url : undefined
  }));
`;

homeContent = homeContent.replace(/const featuredVehicles = await db[\s\S]*?\.limit\(8\);/, newHomeQueries);
fs.writeFileSync('src/app/(public)/page.tsx', homeContent, 'utf8');

console.log("Pages updated to fetch images");
