import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventosPago, pagos, destacadosActivos } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const eventos = await db.select().from(eventosPago).orderBy(desc(eventosPago.creadoEn)).limit(10);
    const ultimosPagos = await db.select().from(pagos).orderBy(desc(pagos.creadoEn)).limit(5);
    const ultimosDestacados = await db.select().from(destacadosActivos).orderBy(desc(destacadosActivos.creadoEn)).limit(5);

    return NextResponse.json({ 
      eventos, 
      ultimosPagos, 
      ultimosDestacados 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
