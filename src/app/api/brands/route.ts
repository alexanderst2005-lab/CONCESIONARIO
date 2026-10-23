import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands, vehicles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all brands (by default active only, or all if ?all=true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    let query = db.select().from(brands);
    if (!all) {
      query = query.where(eq(brands.isActive, true)) as any;
    }

    const allBrands = await query.orderBy(asc(brands.sortOrder), asc(brands.name));
    return NextResponse.json(allBrands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ message: "Error fetching brands" }, { status: 500 });
  }
}

// POST create new brand (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    console.error("Error creating brand:", error);
    return NextResponse.json({ message: "Error creating brand" }, { status: 500 });
  }
}

// PATCH update brand (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    console.error("Error updating brand:", error);
    return NextResponse.json({ message: "Error updating brand" }, { status: 500 });
  }
}

// DELETE brand (permanent delete or soft deactivate)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const parsedId = parseInt(id);

    if (permanent) {
      // Verificar si hay vehículos asociados
      const associatedVehicles = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(eq(vehicles.brandId, parsedId))
        .limit(1);

      if (associatedVehicles.length > 0) {
        return NextResponse.json(
          { message: "No se puede eliminar porque hay vehículos asociados a esta marca en el inventario. En su lugar, desactívala." },
          { status: 409 }
        );
      }

      const [eliminada] = await db
        .delete(brands)
        .where(eq(brands.id, parsedId))
        .returning();

      if (!eliminada) {
        return NextResponse.json({ message: "Marca no encontrada" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Marca eliminada permanentemente" });
    }

    // Soft delete / desactivar
    await db
      .update(brands)
      .set({ isActive: false })
      .where(eq(brands.id, parsedId));

    return NextResponse.json({ success: true, message: "Marca desactivada" });
  } catch (error: any) {
    if (error.code === "23503") {
      return NextResponse.json(
        { message: "No se puede eliminar porque tiene datos vinculados. Desactívala en su lugar." },
        { status: 409 }
      );
    }
    console.error("Error deleting brand:", error);
    return NextResponse.json({ message: "Error al procesar la solicitud" }, { status: 500 });
  }
}
