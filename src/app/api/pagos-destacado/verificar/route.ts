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

    // Solo procesamos si el pago está pendiente (evita conflictos si el webhook llegó primero)
    if (pagoDB.estado === "pendiente") {
      if (status === "APPROVED") {
        await activarOExtenderDestacado(pagoDB.id, transactionId, paymentMethod || "WIDGET");
      } else if (["DECLINED", "ERROR", "VOIDED"].includes(status)) {
        await rechazarPago(pagoDB.id, transactionId);
      }
    }

    return NextResponse.json({ 
      success: true, 
      estadoFinal: status === "APPROVED" ? "aprobado" : "rechazado_o_pendiente" 
    });

  } catch (error: any) {
    console.error("[pagos-destacado/verificar]", error);
    return NextResponse.json({ message: `Error interno de sincronización: ${error.message}` }, { status: 500 });
  }
}
