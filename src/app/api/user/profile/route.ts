import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, lastName, phone, birthDate } = body;

    const dateObj = birthDate ? new Date(birthDate) : null;

    await db.update(users)
      .set({ 
        name, 
        lastName, 
        phone: phone || null, 
        birthDate: dateObj 
      })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
