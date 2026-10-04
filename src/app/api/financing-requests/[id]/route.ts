import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await db.delete(financingRequests).where(eq(financingRequests.id, Number(id)));

    return NextResponse.json({ message: "Solicitud eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
