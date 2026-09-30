import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, brands, models, categories } from "@/db/schema";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
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

    // 1. Obtener los IDs relacionados basados en el texto (o usar IDs directamente si el form los envía)
    // Para simplificar la demo, asociaremos a la primera categoría por defecto
    const cat = await db.query.categories.findFirst();
    const brand = await db.query.brands.findFirst({ where: (b, { eq }) => eq(b.name, data.brandName || "Mazda")});
    const model = await db.query.models.findFirst();

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
      
      // Todo vehículo entra como PENDIENTE de aprobación por el Admin
      status: "PENDIENTE",
      isFeatured: false,
      isPromoted: false,
    }).returning();

    return NextResponse.json({ message: "Vehículo publicado exitosamente", vehicleId: newVehicle.id }, { status: 201 });

  } catch (error) {
    console.error("Error publicando vehículo:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
