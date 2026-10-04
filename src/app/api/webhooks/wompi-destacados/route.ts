import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eventosPago, pagos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validarFirmaWebhook } from "@/lib/wompi/crypto";
import { activarOExtenderDestacado, rechazarPago } from "@/lib/destacados/activacion";

export const dynamic = "force-dynamic";

/**
 * Registra un evento en la tabla de auditoría.
 */
async function registrarAuditoria(payload: {
  pagoId?: string;
  referencia?: string;
  evento: string;
  estadoWompi?: string;
  firmaValida?: boolean;
  ip?: string;
}) {
  try {
    await db.insert(eventosPago).values({
      pagoId: payload.pagoId,
      referencia: payload.referencia,
      origen: "webhook",
      evento: payload.evento,
      estadoWompi: payload.estadoWompi,
      firmaValida: payload.firmaValida,
      ip: payload.ip,
    });
  } catch (e) {
    console.error("[Wompi Webhook] Error registrando auditoría:", e);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "desconocida";
  let payload: any;
  
  try {
    payload = await req.json();
  } catch (e) {
    return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
  }

  const eventoWompi = payload?.event;
  const dataTransaccion = payload?.data?.transaction;
  const referencia = dataTransaccion?.reference;
  const estadoWompi = dataTransaccion?.status; // APPROVED, DECLINED, VOIDED, ERROR
  const montoEnCentavos = dataTransaccion?.amount_in_cents;
  const idTransaccionWompi = dataTransaccion?.id;
  const metodoPago = dataTransaccion?.payment_method_type;

  if (!referencia || !idTransaccionWompi || eventoWompi !== "transaction.updated") {
    // Si no es transaction.updated o faltan datos, lo ignoramos respondiendo 200 para que Wompi no reintente
    return NextResponse.json({ received: true });
  }

  // 1. Validar la firma
  const firmaValida = validarFirmaWebhook(payload);
  
  if (!firmaValida) {
    console.error(`[Wompi Webhook] Firma INVÁLIDA para referencia: ${referencia}`);
    await registrarAuditoria({
      referencia,
      evento: "firma_invalida",
      estadoWompi,
      firmaValida: false,
      ip,
    });
    return NextResponse.json({ received: true }); // Respondemos 200 para evitar reintentos de ataque
  }

  // 2. Buscar el pago en la BD
  // No usamos dbTx aquí para la lectura porque solo queremos validar que exista y obtener el ID real.
  const [pagoDB] = await db.select().from(pagos).where(eq(pagos.referenciaUnica, referencia)).limit(1);

  if (!pagoDB) {
    console.error(`[Wompi Webhook] Pago no encontrado: ${referencia}`);
    await registrarAuditoria({
      referencia,
      evento: "pago_no_encontrado",
      estadoWompi,
      firmaValida: true,
      ip,
    });
    return NextResponse.json({ received: true });
  }

  // 3. Validar consistencia del monto (Sección 10-A)
  if (pagoDB.monto * 100 !== montoEnCentavos) {
    console.error(`[Wompi Webhook] Monto no coincide para ${referencia}. BD: ${pagoDB.monto * 100}, Wompi: ${montoEnCentavos}`);
    await registrarAuditoria({
      pagoId: pagoDB.id,
      referencia,
      evento: "monto_no_coincide",
      estadoWompi,
      firmaValida: true,
      ip,
    });
    return NextResponse.json({ received: true });
  }

  // 4. Procesar según el estado de Wompi (usando las transacciones de dbTx)
  try {
    if (estadoWompi === "APPROVED") {
      const resultado = await activarOExtenderDestacado(pagoDB.id, idTransaccionWompi, metodoPago);
      await registrarAuditoria({
        pagoId: pagoDB.id,
        referencia,
        evento: resultado.yaEstabaAprobado ? "idempotencia_exitosa" : "aprobado",
        estadoWompi,
        firmaValida: true,
        ip,
      });
    } else if (["DECLINED", "ERROR", "VOIDED"].includes(estadoWompi)) {
      await rechazarPago(pagoDB.id, idTransaccionWompi);
      await registrarAuditoria({
        pagoId: pagoDB.id,
        referencia,
        evento: "rechazado",
        estadoWompi,
        firmaValida: true,
        ip,
      });
    } else {
      // Estado pendiente o irrelevante
      await registrarAuditoria({
        pagoId: pagoDB.id,
        referencia,
        evento: "ignorado_por_estado",
        estadoWompi,
        firmaValida: true,
        ip,
      });
    }
  } catch (error) {
    console.error(`[Wompi Webhook] Error procesando pago ${referencia}:`, error);
    await registrarAuditoria({
      pagoId: pagoDB.id,
      referencia,
      evento: "error_interno",
      estadoWompi,
      firmaValida: true,
      ip,
    });
    // Respondemos 500 para que Wompi reintente luego
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
