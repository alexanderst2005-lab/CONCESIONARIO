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
      return NextResponse.json({ message: "Lo sentimos, tu usuario no se encuentra en la base de datos." }, { status: 404 });
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
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // We assume the app runs on localhost for dev, but in prod it will be the real domain
    // we can construct it from req.url or use a generic one if we have an ENV var
    let origin = (process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000").trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(origin)) origin = `https://${origin}`;
    const resetUrl = `${origin}/restablecer?token=${token}`;

    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
    const mailOptions = {
      from: `"Autos El Patrón" <${fromEmail}>`,
      to: email,
      subject: "Recuperación de contraseña - AutosElPatron",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
          <p style="color: #555; font-size: 16px;">Hola ${user.name},</p>
          <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en AutosElPatron.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #cda434; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
          </div>
          <p style="color: #555; font-size: 16px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <div style="background-color: #fff6d6; border: 1px solid #cda434; border-radius: 6px; padding: 12px; margin-top: 20px;">
            <p style="color: #7a5c00; font-size: 14px; margin: 0;"><strong>¿Este correo llegó a spam?</strong> Márcalo como <strong>"No es spam"</strong> para que el botón funcione correctamente.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px; text-align: center;">AutosElPatron - El concesionario premium</p>
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
