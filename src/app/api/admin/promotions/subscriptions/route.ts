import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
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
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const allSubscriptions = await db.query.subscriptions.findMany({
      orderBy: (subs, { desc }) => [desc(subs.createdAt)],
      with: {
        user: true,
        plan: true,
        vehicle: {
          with: {
            brand: true,
            model: true
          }
        },
        payments: true
      }
    });

    return NextResponse.json(allSubscriptions);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
