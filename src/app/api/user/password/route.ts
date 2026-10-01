import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!userRecord) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
    if (!isMatch) {
      return NextResponse.json({ message: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userRecord.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
