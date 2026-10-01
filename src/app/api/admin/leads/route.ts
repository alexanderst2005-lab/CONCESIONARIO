import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, vehicles as vehiclesTable, users, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const allLeads = await db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        email: leads.email,
        channel: leads.channel,
        status: leads.status,
        createdAt: leads.createdAt,
        vehicleBrand: brands.name,
        vehicleModel: models.name,
        sellerName: users.name,
      })
      .from(leads)
      .leftJoin(vehiclesTable, eq(leads.vehicleId, vehiclesTable.id))
      .leftJoin(brands, eq(vehiclesTable.brandId, brands.id))
      .leftJoin(models, eq(vehiclesTable.modelId, models.id))
      .leftJoin(users, eq(leads.sellerId, users.id))
      .orderBy(desc(leads.createdAt));

    return NextResponse.json(allLeads);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ message: "Bad request" }, { status: 400 });
    
    const [updated] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
