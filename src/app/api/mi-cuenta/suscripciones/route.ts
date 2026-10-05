import { NextResponse } from "next/server";
import { db } from "@/db";
import { destacadosActivos, vehicles, planesDestacado, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = Number((session.user as any).id);

    // Fetch user's active/expired features from Phase 1 tables
    const destacados = await db
      .select({
        id: destacadosActivos.id,
        iniciaEn: destacadosActivos.iniciaEn,
        terminaEn: destacadosActivos.terminaEn,
        estado: destacadosActivos.estado, // 'activo' | 'expirado'
        vehiculo: {
          id: vehicles.id,
          isFeatured: vehicles.isFeatured,
          brandName: brands.name,
          modelName: models.name
        },
        plan: {
          id: planesDestacado.id,
          nombre: planesDestacado.nombre,
          precio: planesDestacado.precio,
          duracionDias: planesDestacado.duracionDias
        }
      })
      .from(destacadosActivos)
      .innerJoin(vehicles, eq(destacadosActivos.vehiculoId, vehicles.id))
      .leftJoin(brands, eq(vehicles.brandId, brands.id))
      .leftJoin(models, eq(vehicles.modelId, models.id))
      .innerJoin(planesDestacado, eq(destacadosActivos.planId, planesDestacado.id))
      .where(eq(vehicles.userId, userId))
      .orderBy(desc(destacadosActivos.creadoEn));

    // For each featured vehicle, fetch its main image
    const vehicleIds = destacados.map(d => d.vehiculo.id);
    const images = vehicleIds.length > 0 ? await db.query.vehicleImages.findMany({
      where: (vi, { inArray }) => inArray(vi.vehicleId, vehicleIds)
    }) : [];

    // Map to the format SubscriptionsTab expects (so we don't have to rewrite the whole UI yet)
    const mapped = destacados.map(d => {
      const isExpired = new Date(d.terminaEn) < new Date() || d.estado === 'expirado';
      const mainImage = images.find(img => img.vehicleId === d.vehiculo.id && img.isMain) || images.find(img => img.vehicleId === d.vehiculo.id);

      return {
        id: d.id,
        status: isExpired ? 'expired' : 'active',
        amount: d.plan.precio,
        currentPeriodEnd: d.terminaEn,
        nextBillingDate: null, // Prepaid, no billing
        plan: {
          name: d.plan.nombre,
          interval: 'month'
        },
        vehicle: {
          id: d.vehiculo.id,
          isFeatured: d.vehiculo.isFeatured,
          brand: { name: d.vehiculo.brandName },
          model: { name: d.vehiculo.modelName },
          imageUrl: mainImage?.url
        }
      };
    });

    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[mis-suscripciones][GET]", error);
    return NextResponse.json({ message: "Error al cargar suscripciones" }, { status: 500 });
  }
}
