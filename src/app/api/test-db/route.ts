import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, brands } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function GET() {
  const allBrands = await db.select().from(brands);
  const allVehicles = await db.query.vehicles.findMany({
    with: { brand: true, category: true, model: true }
  });
  return NextResponse.json({ allBrands, allVehicles });
}
