import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { promotionPlans, subscriptions, vehicles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, session.user!.email!)
    });
    if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 });

    const data = await req.json();
    const { vehicleId, planId } = data;

    if (!vehicleId || !planId) return NextResponse.json({ message: "Faltan datos" }, { status: 400 });

    // Validar que el vehículo pertenezca al usuario y esté activo
    const vehicle = await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, parseInt(vehicleId)), eq(vehicles.userId, user.id))
    });

    if (!vehicle) return NextResponse.json({ message: "Vehículo no encontrado o no te pertenece" }, { status: 404 });
    if (vehicle.status !== "ACTIVO") return NextResponse.json({ message: "El vehículo debe estar aprobado para ser destacado" }, { status: 400 });

    // Obtener precio real de la BD
    const plan = await db.query.promotionPlans.findFirst({
      where: eq(promotionPlans.id, parseInt(planId))
    });

    if (!plan || !plan.active) return NextResponse.json({ message: "Plan no válido o inactivo" }, { status: 400 });

    // Crear la suscripción pendiente en nuestra base de datos
    const [newSub] = await db.insert(subscriptions).values({
      userId: user.id,
      vehicleId: vehicle.id,
      planId: plan.id,
      status: 'pending',
      amount: plan.amount,
    }).returning();

    // Aquí, en una implementación completa de Wompi, devolveríamos la firma criptográfica
    // (signature) calculada con el monto y la referencia (newSub.id) para el Widget de Wompi.
    
    // Como Wompi usa una llave pública para el widget, la enviamos junto con la referencia
    return NextResponse.json({ 
      message: "Suscripción iniciada", 
      subscriptionId: newSub.id,
      amountInCents: plan.amount * 100, // Wompi usa centavos
      reference: `SUB_${newSub.id}_${Date.now()}`, // Referencia única
      wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || "pub_test_wompi_dummy_key"
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear suscripción:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
