import { NextResponse } from "next/server";
import { db } from "@/db";
import { banks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allBanks = await db.select().from(banks).orderBy(banks.name);
    return NextResponse.json(allBanks);
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json({ message: "Error al obtener bancos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, rate, terms, isActive } = body;
    
    if (!name || !rate) {
      return NextResponse.json({ message: "Nombre y tasa son requeridos" }, { status: 400 });
    }
    
    await db.insert(banks).values({
      name,
      rate: rate.toString(),
      terms: terms || [],
      isActive: isActive !== undefined ? isActive : true
    });
    
    return NextResponse.json({ message: "Banco creado exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Error creating bank:", error);
    return NextResponse.json({ message: "Error al crear banco" }, { status: 500 });
  }
}
