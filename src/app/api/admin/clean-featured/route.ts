import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Quitar el destacado de todos los vehículos
    await db.update(vehicles).set({ isFeatured: false });
    return NextResponse.json({ success: true, message: "Todos los vehículos fueron des-destacados limpiamente." });
  } catch (error) {
    console.error("Error limpiando destacados:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
