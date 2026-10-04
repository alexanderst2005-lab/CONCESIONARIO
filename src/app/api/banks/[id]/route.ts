import { NextResponse } from "next/server";
import { db } from "@/db";
import { banks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const body = await req.json();
    const { name, rate, terms, isActive } = body;
    
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (rate !== undefined) updateData.rate = rate.toString();
    if (terms !== undefined) updateData.terms = terms;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(banks).set(updateData).where(eq(banks.id, id));
    
    return NextResponse.json({ message: "Banco actualizado" });
  } catch (error) {
    console.error("Error updating bank:", error);
    return NextResponse.json({ message: "Error al actualizar banco" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    await db.delete(banks).where(eq(banks.id, id));
    
    return NextResponse.json({ message: "Banco eliminado" });
  } catch (error) {
    console.error("Error deleting bank:", error);
    return NextResponse.json({ message: "Error al eliminar banco" }, { status: 500 });
  }
}
