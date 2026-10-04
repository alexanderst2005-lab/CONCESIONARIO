import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });
    if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const resolvedParams = await params;
    const subId = parseInt(resolvedParams.id);

    const subscription = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id))
    });

    if (!subscription) return NextResponse.json({ message: "Suscripción no encontrada" }, { status: 404 });

    // Cancelar: status a 'canceled', marcamos la fecha de cancelación
    // Nota: El currentPeriodEnd se mantiene intacto, así que un CRON sabrá cuándo quitar el destacado
    await db.update(subscriptions).set({
      status: 'canceled',
      cancelledAt: new Date(),
      updatedAt: new Date()
    }).where(eq(subscriptions.id, subId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al cancelar suscripción:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
