import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles as vehiclesTable, users, brands, models } from "@/db/schema";
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

    const allVehiclesRaw = await db.query.vehicles.findMany({
      orderBy: [desc(vehiclesTable.createdAt)],
      with: {
        brand: true,
        model: true,
        user: true,
        images: true
      }
    });

    const allVehicles = allVehiclesRaw.map(v => ({
      id: v.id,
      slug: v.slug,
      brandName: v.brand?.name,
      modelName: v.model?.name,
      version: v.version,
      year: v.year,
      city: v.city,
      price: v.price,
      status: v.status,
      isFeatured: v.isFeatured,
      createdAt: v.createdAt,
      userName: v.user?.name,
      userLastName: v.user?.lastName,
      userPhone: v.user?.phone,
      userEmail: v.user?.email,
      images: v.images
    }));

    return NextResponse.json(allVehicles);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    await db.update(vehiclesTable).set({ status }).where(eq(vehiclesTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
