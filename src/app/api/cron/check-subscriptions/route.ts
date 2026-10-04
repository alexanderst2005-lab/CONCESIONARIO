import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, vehicles } from "@/db/schema";
import { lt, and, inArray, eq } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();

    // 1. Buscar todas las suscripciones que fueron CANCELADAS y su currentPeriodEnd ya expiró
    const expiredSubs = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.status, 'canceled'),
        lt(subscriptions.currentPeriodEnd, now)
      )
    });

    if (expiredSubs.length > 0) {
      const vehicleIds = expiredSubs.map(s => s.vehicleId);
      const subIds = expiredSubs.map(s => s.id);

      // 2. Quitar el destacado de los vehículos
      await db.update(vehicles)
        .set({ isFeatured: false })
        .where(inArray(vehicles.id, vehicleIds));

      // 3. (Opcional) Cambiar el status de la suscripción de canceled a expired para no volverla a procesar
      await db.update(subscriptions)
        .set({ status: 'expired' })
        .where(inArray(subscriptions.id, subIds));
    }

    // 4. Expirar intentos de pago de más de 5 minutos (PENDING, FAILED, ERROR)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    
    // Importamos subscriptionPayments desde schema. Import debe estar arriba pero usamos raw types aquí si no está
    const { subscriptionPayments } = await import("@/db/schema");
    
    await db.update(subscriptionPayments)
      .set({ status: 'EXPIRED' })
      .where(
        and(
          inArray(subscriptionPayments.status, ['PENDING', 'FAILED', 'ERROR']),
          lt(subscriptionPayments.createdAt, fiveMinutesAgo)
        )
      );

    return NextResponse.json({ 
      success: true, 
      message: `Procesadas ${expiredSubs.length} suscripciones expiradas.` 
    });
  } catch (error) {
    console.error("Error en CRON de suscripciones:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
