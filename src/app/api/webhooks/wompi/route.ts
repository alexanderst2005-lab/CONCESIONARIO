import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, subscriptionPayments, vehicles, promotionPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
      
      // Extraemos la información del intento de pago de la referencia
      // Formato: PAYINT_{userId}_{vehicleId}_{planId}_{timestamp}
      // O para compatibilidad hacia atrás: SUB_{subId}_{timestamp}
      const refParts = reference.split("_");
      
      let userId, vehicleId, planId, oldSubId;
      let isNewFlow = refParts[0] === "PAYINT";

      if (isNewFlow) {
        userId = parseInt(refParts[1]);
        vehicleId = parseInt(refParts[2]);
        planId = parseInt(refParts[3]);
      } else if (refParts[0] === "SUB") {
        oldSubId = parseInt(refParts[1]);
      }

      if (!isNewFlow && isNaN(oldSubId as number)) return NextResponse.json({ message: "Referencia inválida" }, { status: 400 });
      if (isNewFlow && (isNaN(userId as number) || isNaN(vehicleId as number) || isNaN(planId as number))) return NextResponse.json({ message: "Referencia PAYINT inválida" }, { status: 400 });

      // Actualizamos el historial de transacciones (el intento de pago)
      // Buscamos si existe el intento previo
      const paymentIntent = await db.query.subscriptionPayments.findFirst({
        where: eq(subscriptionPayments.reference, reference)
      });

      if (paymentIntent) {
        await db.update(subscriptionPayments).set({
          status: status,
          transactionId: transaction.id,
          amount: transaction.amount_in_cents / 100,
          paidAt: status === "APPROVED" ? new Date() : null,
        }).where(eq(subscriptionPayments.id, paymentIntent.id));
      } else {
        // Por si llega primero el webhook o no se guardó el pending
        await db.insert(subscriptionPayments).values({
          subscriptionId: oldSubId || null,
          userId: userId || null,
          vehicleId: vehicleId || null,
          planId: planId || null,
          amount: transaction.amount_in_cents / 100,
          transactionId: transaction.id,
          reference: reference,
          status: status,
          paidAt: status === "APPROVED" ? new Date() : null,
        });
      }

      if (status === "APPROVED") {
        const now = new Date();
        const nextBilling = new Date();
        
        // Obtener el plan para el intervalo
        let thePlanId = planId;
        if (!isNewFlow && oldSubId) {
          const oldSub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, oldSubId) });
          if (oldSub) thePlanId = oldSub.planId;
        }

        const plan = thePlanId ? await db.query.promotionPlans.findFirst({ where: eq(promotionPlans.id, thePlanId) }) : null;

        if (plan && plan.interval === 'month') {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else if (plan && plan.interval === 'year') {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        } else {
          nextBilling.setDate(nextBilling.getDate() + 30);
        }

        let activeSubscriptionId = oldSubId;

        if (isNewFlow && userId && vehicleId && planId) {
          // Buscamos si ya existe una suscripción para evitar duplicados por webhooks idempotentes
          const existingSub = await db.query.subscriptions.findFirst({
            where: and(eq(subscriptions.userId, userId), eq(subscriptions.vehicleId, vehicleId))
          });

          if (existingSub) {
             // Es una renovación o webhook duplicado
             activeSubscriptionId = existingSub.id;
             await db.update(subscriptions).set({
               status: 'active',
               planId: planId,
               amount: transaction.amount_in_cents / 100,
               lastPaymentDate: now,
               nextBillingDate: nextBilling,
               currentPeriodEnd: nextBilling,
               wompiPaymentSourceId: transaction.payment_method?.token || existingSub.wompiPaymentSourceId,
               updatedAt: now
             }).where(eq(subscriptions.id, existingSub.id));
          } else {
             // Creamos la SUSCRIPCIÓN REAL ahora sí
             const [newSub] = await db.insert(subscriptions).values({
               userId: userId,
               vehicleId: vehicleId,
               planId: planId,
               status: 'active',
               amount: transaction.amount_in_cents / 100,
               startDate: now,
               lastPaymentDate: now,
               nextBillingDate: nextBilling,
               currentPeriodEnd: nextBilling,
               wompiPaymentSourceId: transaction.payment_method?.token || null,
             }).returning();
             activeSubscriptionId = newSub.id;
          }
          
          // Actualizamos el intento de pago para linkearlo a la suscripción real
          await db.update(subscriptionPayments).set({
            subscriptionId: activeSubscriptionId
          }).where(eq(subscriptionPayments.reference, reference));

        } else if (oldSubId) {
           // Flujo antiguo: la suscripción ya existía como pending
           await db.update(subscriptions).set({
             status: 'active',
             startDate: now, // Si ya tenía no importa, se actualiza
             lastPaymentDate: now,
             nextBillingDate: nextBilling,
             currentPeriodEnd: nextBilling,
             wompiPaymentSourceId: transaction.payment_method?.token || null,
             updatedAt: now
           }).where(eq(subscriptions.id, oldSubId));
        }

        // Destacamos el vehículo! (Regla 10)
        let finalVehicleId: number | null = null;
        if (isNewFlow && vehicleId) {
            finalVehicleId = vehicleId;
        } else if (oldSubId) {
            const tempSub = await db.query.subscriptions.findFirst({where: eq(subscriptions.id, oldSubId)});
            if (tempSub) finalVehicleId = tempSub.vehicleId;
        }

        if (finalVehicleId) {
            await db.update(vehicles)
              .set({ isFeatured: true })
              .where(eq(vehicles.id, finalVehicleId));
        }

      } else if (status === "DECLINED" || status === "ERROR" || status === "FAILED") {
        // Si es flujo nuevo, no hay suscripción que poner en past_due si era intento inicial.
        // Si ya existía suscripción (renovación fallida), la ponemos en past_due.
        if (isNewFlow && userId && vehicleId) {
          const existingSub = await db.query.subscriptions.findFirst({
            where: and(eq(subscriptions.userId, userId), eq(subscriptions.vehicleId, vehicleId))
          });
          if (existingSub) {
             await db.update(subscriptions).set({
               status: 'past_due',
               updatedAt: new Date()
             }).where(eq(subscriptions.id, existingSub.id));
             
             // Si el currentPeriodEnd ya pasó, quitar el destacado (Regla 13)
             if (existingSub.currentPeriodEnd && existingSub.currentPeriodEnd < new Date()) {
                await db.update(vehicles).set({ isFeatured: false }).where(eq(vehicles.id, vehicleId));
             }
          }
        } else if (oldSubId) {
           await db.update(subscriptions).set({
             status: 'past_due',
             updatedAt: new Date()
           }).where(eq(subscriptions.id, oldSubId));
           
           const oldSub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.id, oldSubId) });
           if (oldSub && oldSub.currentPeriodEnd && oldSub.currentPeriodEnd < new Date()) {
              await db.update(vehicles).set({ isFeatured: false }).where(eq(vehicles.id, oldSub.vehicleId));
           }
        }
      }
    }

    // Wompi exige que siempre se responda con 200 OK para saber que recibimos el evento
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("Error en Webhook de Wompi:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
