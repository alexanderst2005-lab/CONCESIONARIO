import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, ne, and, or, isNotNull } from "drizzle-orm";
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

    const destacados = await db.query.destacadosActivos.findMany({
      orderBy: (dest, { desc }) => [desc(dest.creadoEn)],
      with: {
        vehiculo: {
          with: {
            user: true,
            brand: true,
            model: true
          }
        },
        plan: true,
        pago: true
      }
    });

    // Map to the format the admin UI expects
    const mapped = destacados.map(d => {
      const isExpired = new Date(d.terminaEn) < new Date() || d.estado === 'expirado';
      
      return {
        id: d.id,
        status: isExpired ? 'expired' : 'active',
        amount: d.pago?.monto || d.plan?.precio || 0,
        nextBillingDate: d.terminaEn, // We use this field to show when it ends
        user: d.vehiculo?.user,
        plan: {
          name: d.plan?.nombre || "Plan Único",
          interval: "pago único"
        },
        vehicle: {
          id: d.vehiculo?.id,
          isFeatured: d.vehiculo?.isFeatured,
          brand: { name: d.vehiculo?.brand?.name },
          model: { name: d.vehiculo?.model?.name }
        },
        payments: d.pago ? [{
          id: d.pago.id,
          status: d.pago.estado === 'aprobado' ? 'APPROVED' : d.pago.estado.toUpperCase(),
          amount: d.pago.monto
        }] : []
      };
    });

    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin/promotions/subscriptions]", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
