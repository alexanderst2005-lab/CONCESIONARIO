import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles as vehiclesTable, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id, isFeatured } = await request.json();
    if (!id || isFeatured === undefined) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    await db.update(vehiclesTable).set({ isFeatured }).where(eq(vehiclesTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
