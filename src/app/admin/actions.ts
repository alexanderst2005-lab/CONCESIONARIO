"use server";

import { db } from "@/db";
import { vehicles as vehiclesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveVehicle(vehicleId: number) {
  await db.update(vehiclesTable).set({ status: "ACTIVO" }).where(eq(vehiclesTable.id, vehicleId));
  revalidatePath("/admin");
  revalidatePath("/mi-cuenta");
  revalidatePath("/");
}

export async function rejectVehicle(vehicleId: number) {
  await db.update(vehiclesTable).set({ status: "RECHAZADO" }).where(eq(vehiclesTable.id, vehicleId));
  revalidatePath("/admin");
  revalidatePath("/mi-cuenta");
}
