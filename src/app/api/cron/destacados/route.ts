import { NextResponse } from "next/server";
import { sincronizarDestacadosExpirados } from "@/lib/destacados/limpieza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    await sincronizarDestacadosExpirados();
    return NextResponse.json({ 
      success: true, 
      message: "Sincronización de destacados y suscripciones completada con éxito."
    });
  } catch (error) {
    console.error("[Cron][destacados] Error:", error);
    return NextResponse.json({ message: "Error interno en el cron" }, { status: 500 });
  }
}
