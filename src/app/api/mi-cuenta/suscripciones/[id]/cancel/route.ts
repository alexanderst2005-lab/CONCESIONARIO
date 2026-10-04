import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // En el nuevo modelo pre-pagado no hay renovación automática, 
  // pero proveemos este endpoint para que la UI funcione y el usuario tenga la 
  // confirmación visual de que no habrán cobros futuros (lo cual es cierto).
  return NextResponse.json({ success: true, message: "Cancelación procesada" });
}
