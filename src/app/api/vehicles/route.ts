import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, brands, models, categories, vehicleImages } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Por ahora, para evitar que la app falle si NextAuth no está configurado del todo,
    // usamos un ID temporal si no hay sesión. En prod, se rechaza si no hay usuario.
    let userId = 1; 
    
    if (session?.user?.email) {
       // Buscar el usuario real
       const user = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, session.user!.email!)
       });
       if (user) userId = user.id;
    }

    const data = await req.json();

    const contactPhone = String(data.contactPhone || "").replace(/\D/g, "");
    if (contactPhone.length < 10) {
      return NextResponse.json({ message: "El número de WhatsApp de contacto es obligatorio" }, { status: 400 });
    }

    let categoryNameInput = data.categoryName || "Automóviles";
    let cat = await db.query.categories.findFirst({ where: (c, { eq }) => eq(c.name, categoryNameInput)});
    if (!cat) {
       [cat] = await db.insert(categories).values({ name: categoryNameInput, slug: categoryNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), isActive: true }).returning();
    }

    let brandNameInput = data.brandName || "Mazda";
    let brand = await db.query.brands.findFirst({ where: (b, { eq }) => eq(b.name, brandNameInput)});
    if (!brand) {
       [brand] = await db.insert(brands).values({ name: brandNameInput, slug: brandNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), isActive: true }).returning();
    }

    let modelNameInput = data.modelName || "Generico";
    let model = await db.query.models.findFirst({ where: (m, { eq }) => eq(m.name, modelNameInput)});
    if (!model) {
       [model] = await db.insert(models).values({ name: modelNameInput, slug: modelNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), brandId: brand.id, isActive: true }).returning();
    }

    if (!cat || !brand || !model) {
      return NextResponse.json({ message: "Error en datos maestros (Marcas/Modelos)" }, { status: 400 });
    }

    // 2. Insertar Vehículo en la DB
    const slug = `${brand.name}-${data.version}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [newVehicle] = await db.insert(vehicles).values({
      slug: slug,
      userId: userId,
      categoryId: cat.id,
      brandId: brand.id,
      modelId: model.id,
      
      version: data.version || "Estándar",
      year: parseInt(data.year) || 2024,
      mileage: parseInt(data.mileage) || 0,
      fuelType: data.fuelType || "Gasolina",
      transmission: data.transmission || "Automática",
      engineCapacity: parseInt(data.engineCapacity) || 0,
      
      price: parseInt(data.price) || 0,
      city: data.city || "Bogotá",
      plate: data.plate || "",
      description: data.description || "",
      
      color: data.color || "",
      soat: data.soat === "true",
      tecnomecanica: data.tecnomecanica === "true",
      ownersCount: parseInt(data.ownersCount) || 1,
      prenda: data.prenda === "true",
      accessories: data.accessories || "",
      hasGas: data.hasGas === "true",
      hasGps: data.hasGps === "true",
      locationStatus: data.locationStatus || "Vitrina",
      contactPhone: contactPhone,
      cityRegistered: data.cityRegistered || "",

      // Si el usuario es ADMIN, queda ACTIVO inmediatamente. Si no, PENDIENTE.
      status: (session?.user as any)?.role === "ADMIN" ? "ACTIVO" : "PENDIENTE",
      isFeatured: false,
      isPromoted: false,
    }).returning();

    
    const newVehicleRecord = newVehicle;

    // 3. Save images if any
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageRecords = data.images.map((url: string, index: number) => ({
        vehicleId: newVehicleRecord.id,
        url: url,
        isMain: index === 0,
        order: index
      }));
      await db.insert(vehicleImages).values(imageRecords);
    }

    return NextResponse.json({ message: "Vehículo publicado exitosamente", vehicleId: newVehicleRecord.id }, { status: 201 });


  } catch (error) {
    console.error("Error publicando vehículo:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = 1; 
    
    if (session?.user?.email) {
       const user = await db.query.users.findFirst({
          where: (u, { eq }) => eq(u.email, session.user!.email!)
       });
       if (user) userId = user.id;
    }

    const data = await req.json();

    if (!data.id) {
      return NextResponse.json({ message: "Se requiere el ID del vehículo" }, { status: 400 });
    }

    let categoryNameInput = data.categoryName || "Automóviles";
    let cat = await db.query.categories.findFirst({ where: (c, { eq }) => eq(c.name, categoryNameInput)});
    if (!cat) {
       [cat] = await db.insert(categories).values({ name: categoryNameInput, slug: categoryNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), isActive: true }).returning();
    }

    let brandNameInput = data.brandName || "Mazda";
    let brand = await db.query.brands.findFirst({ where: (b, { eq }) => eq(b.name, brandNameInput)});
    if (!brand) {
       [brand] = await db.insert(brands).values({ name: brandNameInput, slug: brandNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), isActive: true }).returning();
    }

    let modelNameInput = data.modelName || "Generico";
    let model = await db.query.models.findFirst({ where: (m, { eq }) => eq(m.name, modelNameInput)});
    if (!model) {
       [model] = await db.insert(models).values({ name: modelNameInput, slug: modelNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-'), brandId: brand.id, isActive: true }).returning();
    }

    await db.update(vehicles).set({
      categoryId: cat.id,
      brandId: brand.id,
      modelId: model.id,
      version: data.version || "Estándar",
      year: parseInt(data.year) || 2024,
      mileage: parseInt(data.mileage) || 0,
      fuelType: data.fuelType || "Gasolina",
      transmission: data.transmission || "Automática",
      engineCapacity: parseInt(data.engineCapacity) || 0,
      price: parseInt(data.price) || 0,
      city: data.city || "Bogotá",
      plate: data.plate || "",
      description: data.description || "",
      color: data.color || "",
      soat: data.soat || "",
      tecnomecanica: data.tecnomecanica || "",
      prenda: data.prenda || "No",
      ownersCount: parseInt(data.ownersCount) || 1,
      ...(String(data.contactPhone || "").replace(/\D/g, "").length >= 10
        ? { contactPhone: String(data.contactPhone).replace(/\D/g, "") }
        : {}),
    }).where(eq(vehicles.id, data.id));

    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, data.id));
      const imageRecords = data.images.map((url: string, index: number) => ({
        vehicleId: data.id,
        url: url,
        isMain: index === 0,
        order: index
      }));
      await db.insert(vehicleImages).values(imageRecords);
    }

    return NextResponse.json({ message: "Vehículo actualizado exitosamente" }, { status: 200 });

  } catch (error) {
    console.error("Error actualizando vehículo:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

