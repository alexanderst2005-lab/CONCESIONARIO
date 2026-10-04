import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { promotionPlans, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const plans = await db.query.promotionPlans.findMany({
      orderBy: (plans, { asc }) => [asc(plans.amount)],
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener planes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    
    const newPlan = await db.insert(promotionPlans).values({
      name: data.name,
      description: data.description,
      amount: parseInt(data.amount),
      interval: data.interval || 'month',
      active: true,
    }).returning();
    
    return NextResponse.json(newPlan[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error al crear plan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    
    if (!data.id) return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    
    const updated = await db.update(promotionPlans).set({
      name: data.name,
      description: data.description,
      amount: data.amount ? parseInt(data.amount) : undefined,
      active: data.active !== undefined ? data.active : undefined,
      updatedAt: new Date(),
    }).where(eq(promotionPlans.id, data.id)).returning();
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ message: "Error al actualizar plan" }, { status: 500 });
  }
}
