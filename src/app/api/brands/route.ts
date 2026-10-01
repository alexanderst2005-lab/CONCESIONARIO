import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";

// GET all active brands sorted by sortOrder
export async function GET() {
  try {
    const allBrands = await db
      .select()
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.sortOrder), asc(brands.name));

    return NextResponse.json(allBrands);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching brands" }, { status: 500 });
  }
}

// POST create new brand (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, logoUrl, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const [newBrand] = await db
      .insert(brands)
      .values({ name, slug, logoUrl, sortOrder: sortOrder || 0, isActive: true })
      .returning();

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Brand already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: "Error creating brand" }, { status: 500 });
  }
}

// PATCH update brand (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, logoUrl, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(brands)
      .set(updates)
      .where(eq(brands.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error updating brand" }, { status: 500 });
  }
}

// DELETE (soft delete — just set isActive = false)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await db
      .update(brands)
      .set({ isActive: false })
      .where(eq(brands.id, parseInt(id)));

    return NextResponse.json({ message: "Brand deactivated" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting brand" }, { status: 500 });
  }
}
