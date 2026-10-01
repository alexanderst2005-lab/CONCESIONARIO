import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, vehicleImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, session.user!.email!)
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 401 });
    }

    const { id } = await params;
    const vehicleId = parseInt(id);

    if (isNaN(vehicleId)) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    // Buscar el vehículo para verificar que sea del usuario o que sea admin
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, vehicleId)
    });

    if (!vehicle) {
      return NextResponse.json({ message: "Vehículo no encontrado" }, { status: 404 });
    }

    if (vehicle.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ message: "No tienes permiso para eliminar este vehículo" }, { status: 403 });
    }

    // Delete associated images first
    await db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, vehicleId));

    // Delete vehicle
    await db.delete(vehicles).where(eq(vehicles.id, vehicleId));

    return NextResponse.json({ message: "Vehículo eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
