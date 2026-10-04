import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pagos, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { obtenerPlanActivoPorId } from "@/lib/destacados/planes";
import { generarFirmaIntegridad } from "@/lib/wompi/crypto";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Validar sesión
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Debes iniciar sesión" }, { status: 401 });
    }
    const usuarioId = Number((session.user as any).id);

    // 2. Leer payload
    let payload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }

    const { vehiculoId, planId } = payload;
    if (!vehiculoId || !planId) {
      return NextResponse.json({ message: "Faltan datos (vehículo o plan)" }, { status: 400 });
    }

    // 3. Validar vehículo (que exista y pertenezca al usuario)
    const [vehiculo] = await db.select({ id: vehicles.id, userId: vehicles.userId })
      .from(vehicles).where(eq(vehicles.id, Number(vehiculoId))).limit(1);

    if (!vehiculo) {
      return NextResponse.json({ message: "Vehículo no encontrado" }, { status: 404 });
    }
    if (vehiculo.userId !== usuarioId) {
      return NextResponse.json({ message: "No puedes destacar un vehículo que no es tuyo" }, { status: 403 });
    }

    // 4. Validar plan y congelar precio/duración (Sección 10-A)
    const plan = await obtenerPlanActivoPorId(planId);
    if (!plan) {
      return NextResponse.json({ message: "El plan seleccionado no es válido o está inactivo" }, { status: 400 });
    }

    // 5. Generar referencia única no adivinable (Sección 10-B)
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(8).toString("hex"); // 16 caracteres
    const referencia = `DST-${timestamp}-${randomHex}`;
    const montoEnCentavos = plan.precio * 100;

    // 6. Generar firma de integridad (Sección 10-A)
    const firmaIntegridad = generarFirmaIntegridad(referencia, montoEnCentavos, "COP");

    // 7. Guardar el pago en BD como pendiente
    await db.insert(pagos).values({
      referenciaUnica: referencia,
      usuarioId: usuarioId,
      vehiculoId: vehiculo.id,
      planId: plan.id,
      tipo: "destacado",
      monto: plan.precio,
      duracionDiasCompra: plan.duracionDias,
      estado: "pendiente"
    });

    // 8. Retornar datos al cliente para abrir Wompi
    return NextResponse.json({
      referencia,
      montoEnCentavos,
      moneda: "COP",
      firmaIntegridad,
      // La llave pública debe inyectarse aquí si no se quiere exponer globalmente en el frontend,
      // o el frontend puede usar NEXT_PUBLIC_WOMPI_PUBLIC_KEY si ya la tiene.
      // La retornamos para mayor seguridad/control desde el backend.
      wompiPublicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || process.env.WOMPI_PUBLIC_KEY
    });
  } catch (error) {
    console.error("[pagos-destacado][POST]", error);
    return NextResponse.json({ message: "Error interno al iniciar el pago" }, { status: 500 });
  }
}
