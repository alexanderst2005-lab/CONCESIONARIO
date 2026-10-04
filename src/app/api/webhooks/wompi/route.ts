import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, subscriptionPayments, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // En producción, aquí se valida la firma (signature) del evento de Wompi 
    // usando la llave de eventos (Events Key) para comprobar que la petición realmente viene de Wompi.
    // const signature = req.headers.get("x-event-checksum");

    if (data.event === "transaction.updated") {
      const transaction = data.data.transaction;
      const status = transaction.status; // "APPROVED", "DECLINED", "ERROR", etc.
      const reference = transaction.reference; // Ej: SUB_5_1638202...
      
      // Extraemos el ID de la suscripción de la referencia
      const subIdStr = reference.split("_")[1];
      const subId = parseInt(subIdStr);

      if (isNaN(subId)) return NextResponse.json({ message: "Referencia inválida" }, { status: 400 });

      // Buscamos la suscripción
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subId),
        with: { plan: true }
      });

      if (!subscription) return NextResponse.json({ message: "Suscripción no encontrada" }, { status: 404 });

      // Guardamos la transacción en el historial inmutable
      await db.insert(subscriptionPayments).values({
        subscriptionId: subId,
        amount: transaction.amount_in_cents / 100, // Lo volvemos a pesos
        transactionId: transaction.id,
        reference: reference,
        status: status,
        paidAt: status === "APPROVED" ? new Date() : null,
      });

      if (status === "APPROVED") {
        // Activamos la suscripción
        const now = new Date();
        const nextBilling = new Date();
        
        // Sumamos tiempo según el intervalo del plan (asumimos mes por defecto)
        if (subscription.plan.interval === 'month') {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else if (subscription.plan.interval === 'year') {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        } else {
          // Fallback a 30 días
          nextBilling.setDate(nextBilling.getDate() + 30);
        }

        await db.update(subscriptions).set({
          status: 'active',
          startDate: now,
          lastPaymentDate: now,
          nextBillingDate: nextBilling,
          currentPeriodEnd: nextBilling,
          // Extraemos la fuente de pago de la transacción si Wompi la envió (para los futuros cobros recurrentes)
          wompiPaymentSourceId: transaction.payment_method?.token || null,
          updatedAt: now
        }).where(eq(subscriptions.id, subId));

        // Destacamos el vehículo!
        await db.update(vehicles)
          .set({ isFeatured: true })
          .where(eq(vehicles.id, subscription.vehicleId));

      } else if (status === "DECLINED" || status === "ERROR") {
        await db.update(subscriptions).set({
          status: 'past_due', // O rejected si es la primera vez
          updatedAt: new Date()
        }).where(eq(subscriptions.id, subId));
      }
    }

    // Wompi exige que siempre se responda con 200 OK para saber que recibimos el evento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Error en Webhook de Wompi:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
