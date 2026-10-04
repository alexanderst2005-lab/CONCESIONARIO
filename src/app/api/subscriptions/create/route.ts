import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { promotionPlans, subscriptions, vehicles, subscriptionPayments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";

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

    const amountInCents = plan.amount * 100;
    const reference = `PAYINT_${user.id}_${vehicle.id}_${plan.id}_${Date.now()}`;

    // Crear el INTENTO de pago en la base de datos (NO una suscripción)
    await db.insert(subscriptionPayments).values({
      userId: user.id,
      vehicleId: vehicle.id,
      planId: plan.id,
      status: 'PENDING',
      amount: plan.amount,
      reference: reference,
    });

    const currency = 'COP';
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY || "";
    
    // Generar la firma de integridad que exige Wompi (sha256)
    // Formula: referencia + monto_en_centavos + moneda + secreto_de_integridad
    const rawString = `${reference}${amountInCents}${currency}${integrityKey}`;
    const signature = crypto.createHash('sha256').update(rawString).digest('hex');
    
    return NextResponse.json({ 
      message: "Intento de pago iniciado", 
      amountInCents: amountInCents,
      reference: reference,
      signature: signature,
      wompiPublicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || process.env.WOMPI_PUBLIC_KEY || "pub_test_wompi_dummy_key"
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear suscripción:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

