import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email es requerido" }, { status: 400 });
    }

    // Check if user exists
    const userRecords = await db.select().from(users).where(eq(users.email, email));
    if (userRecords.length === 0) {
      // Don't leak existence of user, just pretend it worked
      return NextResponse.json({ message: "Si el correo existe, se ha enviado un enlace." }, { status: 200 });
    }

    const user = userRecords[0];

    // Delete existing tokens for this email
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // We assume the app runs on localhost for dev, but in prod it will be the real domain
    // we can construct it from req.url or use a generic one if we have an ENV var
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const resetUrl = `${origin}/restablecer?token=${token}`;

    const mailOptions = {
      from: `"Autos del Patrón" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Recuperación de contraseña - Autos del Patrón",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
          <p style="color: #555; font-size: 16px;">Hola ${user.name},</p>
          <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Autos del Patrón.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #cda434; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
          </div>
          <p style="color: #555; font-size: 16px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">Autos del Patrón - El concesionario premium</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Si el correo existe, se ha enviado un enlace." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
