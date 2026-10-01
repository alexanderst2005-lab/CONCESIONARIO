import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";

async function checkAdmin() {
  const session = await getServerSession();
  if (!session?.user?.email) return false;
  const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
  return user?.role === "ADMIN";
}

export async function GET() {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id, role } = await request.json();
    if (!id || !role) return NextResponse.json({ message: "Bad request" }, { status: 400 });
    
    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
