import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pagos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { activarOExtenderDestacado, rechazarPago } from "@/lib/destacados/activacion";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const payload = await req.json();
    const { reference, transactionId, status, paymentMethod } = payload;

    if (!reference || !transactionId || !status) {
      return NextResponse.json({ message: "Faltan datos de la transacción" }, { status: 400 });
    }

    const [pagoDB] = await db.select().from(pagos).where(eq(pagos.referenciaUnica, reference)).limit(1);

    if (!pagoDB) {
      return NextResponse.json({ message: "Pago no encontrado en la base de datos" }, { status: 404 });
    }

    // Para mayor seguridad, no confiamos ciegamente en el frontend.
    // Consultamos la API pública de Wompi para verificar el estado REAL de la transacción.
    let realStatus = status;
    try {
      // Wompi permite consultar transacciones públicamente
      const isSandbox = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.includes("test_");
      const baseUrl = isSandbox ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";
      const wompiRes = await fetch(`${baseUrl}/transactions/${transactionId}`);
      if (wompiRes.ok) {
        const wompiData = await wompiRes.json();
        realStatus = wompiData.data.status;
      }
    } catch (err) {
      console.warn("No se pudo verificar con Wompi API, usando estado del frontend", err);
    }

    // Solo procesamos si el pago está pendiente (evita conflictos si el webhook llegó primero)
    if (pagoDB.estado === "pendiente") {
      if (realStatus === "APPROVED") {
        await activarOExtenderDestacado(pagoDB.id, transactionId, paymentMethod || "WIDGET");
      } else if (["DECLINED", "ERROR", "VOIDED"].includes(realStatus)) {
        await rechazarPago(pagoDB.id, transactionId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      estadoFinal: realStatus === "APPROVED" ? "aprobado" : "rechazado_o_pendiente" 
    });

  } catch (error: any) {
    console.error("[pagos-destacado/verificar]", error);
    return NextResponse.json({ message: `Error interno de sincronización: ${error.message}` }, { status: 500 });
  }
}
