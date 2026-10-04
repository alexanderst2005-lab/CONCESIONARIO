import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const subId = parseInt(resolvedParams.id);

    // 1. Obtener la suscripción para saber qué vehículo es
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subId)
    });

    if (sub) {
      // 2. Quitarle el destacado al vehículo
      const { vehicles } = await import("@/db/schema");
      await db.update(vehicles)
        .set({ isFeatured: false })
        .where(eq(vehicles.id, sub.vehicleId));
    }

    // 3. Eliminar la suscripción
    await db.delete(subscriptions).where(eq(subscriptions.id, subId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
