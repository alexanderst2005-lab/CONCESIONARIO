import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { planesDestacado, users } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { parseIdPositivo, validarDatosPlan } from "@/lib/destacados/planes";

/**
 * Administración de planes de destacado (tabla planes_destacado).
 * - Solo ADMIN (verificado en servidor contra la BD, no contra el token).
 * - No existe DELETE: los planes se DESACTIVAN para conservar el historial
 *   de pagos que los referencian.
 * - Cambiar precio/duración NO afecta pagos ya creados (la BD guarda un snapshot).
 */
export const dynamic = "force-dynamic";

async function esAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

const noAutorizado = () => NextResponse.json({ message: "No autorizado" }, { status: 401 });

async function leerJson(req: NextRequest): Promise<unknown> {
  const texto = await req.text();
  if (texto.length > 2_000) throw new Error("payload_grande");
  return JSON.parse(texto);
}

function esNombreDuplicado(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

export async function GET() {
  if (!(await esAdmin())) return noAutorizado();
  try {
    const planes = await db.select().from(planesDestacado).orderBy(asc(planesDestacado.precio));
    return NextResponse.json(planes, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin/planes-destacado][GET]", error);
    return NextResponse.json({ message: "Error al obtener planes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await esAdmin())) return noAutorizado();
  let data: unknown;
  try { data = await leerJson(req); } catch { return NextResponse.json({ message: "Datos inválidos" }, { status: 400 }); }

  const v = validarDatosPlan(data, { parcial: false });
  if (!v.ok) return NextResponse.json({ message: v.error }, { status: 400 });

  try {
    const [nuevo] = await db.insert(planesDestacado).values({
      nombre: v.valores.nombre!,
      duracionDias: v.valores.duracionDias!,
      precio: v.valores.precio!,
      activo: v.valores.activo ?? true,
    }).returning();
    return NextResponse.json(nuevo, { status: 201 });
  } catch (error) {
    if (esNombreDuplicado(error)) return NextResponse.json({ message: "Ya existe un plan con ese nombre" }, { status: 409 });
    console.error("[admin/planes-destacado][POST]", error);
    return NextResponse.json({ message: "Error al crear el plan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await esAdmin())) return noAutorizado();
  let data: unknown;
  try { data = await leerJson(req); } catch { return NextResponse.json({ message: "Datos inválidos" }, { status: 400 }); }

  const id = parseIdPositivo((data as Record<string, unknown> | null)?.id);
  if (id === null) return NextResponse.json({ message: "Plan inválido" }, { status: 400 });

  const v = validarDatosPlan(data, { parcial: true });
  if (!v.ok) return NextResponse.json({ message: v.error }, { status: 400 });
  if (Object.keys(v.valores).length === 0) return NextResponse.json({ message: "Sin cambios" }, { status: 400 });

  try {
    const [actualizado] = await db.update(planesDestacado)
      .set({ ...v.valores, actualizadoEn: new Date() })
      .where(eq(planesDestacado.id, id))
      .returning();
    if (!actualizado) return NextResponse.json({ message: "Plan no encontrado" }, { status: 404 });
    return NextResponse.json(actualizado);
  } catch (error) {
    if (esNombreDuplicado(error)) return NextResponse.json({ message: "Ya existe un plan con ese nombre" }, { status: 409 });
    console.error("[admin/planes-destacado][PUT]", error);
    return NextResponse.json({ message: "Error al actualizar el plan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await esAdmin())) return noAutorizado();
  
  const { searchParams } = new URL(req.url);
  const id = parseIdPositivo(searchParams.get("id"));
  if (id === null) return NextResponse.json({ message: "ID de plan inválido" }, { status: 400 });

  try {
    const [eliminado] = await db.delete(planesDestacado)
      .where(eq(planesDestacado.id, id))
      .returning();
      
    if (!eliminado) return NextResponse.json({ message: "Plan no encontrado" }, { status: 404 });
    return NextResponse.json({ message: "Plan eliminado" });
  } catch (error: any) {
    if (error?.code === "23503") {
      return NextResponse.json({ message: "No se puede eliminar este plan porque ya tiene pagos o vehículos asociados. En su lugar, desactívalo." }, { status: 409 });
    }
    console.error("[admin/planes-destacado][DELETE]", error);
    return NextResponse.json({ message: "Error al eliminar el plan" }, { status: 500 });
  }
}
