import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    // Validate token
    const tokenRecords = await db.select().from(passwordResetTokens).where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    );

    if (tokenRecords.length === 0) {
      return NextResponse.json({ message: "El enlace es inválido o ha expirado" }, { status: 400 });
    }

    const email = tokenRecords[0].email;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

    // Delete token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));

    return NextResponse.json({ message: "Contraseña actualizada con éxito" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
