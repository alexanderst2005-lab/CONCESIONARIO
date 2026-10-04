import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Al igual que cancelar, reactivar es un mock para la UI, ya que si quieren
  // más tiempo deben comprar otro plan (que se extiende automáticamente).
  return NextResponse.json({ success: true, message: "Reactivación procesada" });
}
