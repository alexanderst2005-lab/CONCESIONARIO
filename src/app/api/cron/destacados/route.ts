import { NextResponse } from "next/server";
import { db } from "@/db";
import { dbTx } from "@/db/tx";
import { destacadosActivos, vehicles } from "@/db/schema";
import { eq, lt, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verificación simple de seguridad para evitar llamadas accidentales o maliciosas.
  // Idealmente usar Vercel Cron secret (process.env.CRON_SECRET)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    // Buscar todos los destacados que ya expiraron pero siguen marcados como 'activo'
    const expirados = await db
      .select({ id: destacadosActivos.id, vehiculoId: destacadosActivos.vehiculoId })
      .from(destacadosActivos)
      .where(
        lt(destacadosActivos.terminaEn, new Date())
      );

    if (expirados.length === 0) {
      return NextResponse.json({ message: "No hay vehículos expirados para procesar", count: 0 });
    }

    // Usamos dbTx para garantizar que ambos updates ocurran (o ninguno si falla)
    await dbTx.transaction(async (tx) => {
      const idsExpirados = expirados.map(e => e.id);
      const vehiculosIds = expirados.map(e => e.vehiculoId);

      // 1. Apagar la bandera en la tabla de vehículos
      await tx.update(vehicles)
        .set({ isFeatured: false })
        .where(inArray(vehicles.id, vehiculosIds));

      // 2. Eliminar el registro en destacados_activos para no acumular basura
      await tx.delete(destacadosActivos)
        .where(inArray(destacadosActivos.id, idsExpirados));
    });

    console.log(`[Cron] Se desactivaron ${expirados.length} vehículos destacados.`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Se procesaron ${expirados.length} vehículos.`,
      vehiculosModificados: expirados.length
    });
  } catch (error) {
    console.error("[Cron][destacados] Error:", error);
    return NextResponse.json({ message: "Error interno en el cron" }, { status: 500 });
  }
}
