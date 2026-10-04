import { NextResponse } from "next/server";
import { obtenerPlanesActivos } from "@/lib/destacados/planes";

/**
 * GET /api/planes-destacado — planes ACTIVOS para usuarios.
 * Solo GET (Next.js responde 405 a cualquier otro método).
 * Expone únicamente campos públicos (id, nombre, duración, precio, precio/día).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const planes = await obtenerPlanesActivos();
    return NextResponse.json(planes, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[planes-destacado][GET]", error);
    return NextResponse.json({ message: "No pudimos cargar los planes. Intenta de nuevo." }, { status: 500 });
  }
}
