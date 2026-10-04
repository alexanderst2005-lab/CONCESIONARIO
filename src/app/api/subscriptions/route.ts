import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    });
    if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const userSubscriptions = await db.query.subscriptions.findMany({
      where: and(eq(subscriptions.userId, user.id), not(eq(subscriptions.status, 'pending'))),
      with: {
        plan: true,
        vehicle: {
          with: {
            brand: true,
            model: true
          }
        }
      },
      orderBy: (subs, { desc }) => [desc(subs.createdAt)]
    });

    return NextResponse.json(userSubscriptions);
  } catch (error) {
    console.error("Error obteniendo suscripciones:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
