import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const subId = parseInt(resolvedParams.id);

    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subId),
      with: {
        vehicle: true
      }
    });

    if (!sub || !sub.vehicle) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Alternar el estado isFeatured
    const newFeaturedStatus = !sub.vehicle.isFeatured;
    
    await db.update(vehicles)
      .set({ isFeatured: newFeaturedStatus })
      .where(eq(vehicles.id, sub.vehicleId));

    return NextResponse.json({ success: true, isFeatured: newFeaturedStatus });
  } catch (error) {
    console.error("Error toggling feature status:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
