import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users, vehicles, destacadosActivos } from "@/db/schema";
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
    const subId = resolvedParams.id; // UUID

    const destacado = await db.query.destacadosActivos.findFirst({
      where: eq(destacadosActivos.id, subId),
      with: {
        vehiculo: true
      }
    });

    if (!destacado || !destacado.vehiculo) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Alternar el estado isFeatured
    const newFeaturedStatus = !destacado.vehiculo.isFeatured;
    
    // Si el admin lo apaga, podemos cambiar el estado del destacado a "expirado"
    // Pero la lógica de toggling simple en vehicles.isFeatured es suficiente por ahora
    await db.update(vehicles)
      .set({ isFeatured: newFeaturedStatus })
      .where(eq(vehicles.id, destacado.vehiculoId));

    // Opcionalmente actualizar destacadosActivos.estado
    if (!newFeaturedStatus) {
       await db.update(destacadosActivos).set({ estado: 'expirado' }).where(eq(destacadosActivos.id, subId));
    } else {
       await db.update(destacadosActivos).set({ estado: 'activo' }).where(eq(destacadosActivos.id, subId));
    }

    return NextResponse.json({ success: true, isFeatured: newFeaturedStatus });
  } catch (error) {
    console.error("Error toggling feature status:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
