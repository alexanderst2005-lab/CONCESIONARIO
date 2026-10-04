import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles as vehiclesTable, users, brands, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

    const allVehiclesRaw = await db.query.vehicles.findMany({
      orderBy: [desc(vehiclesTable.createdAt)],
      with: {
        brand: true,
        model: true,
        user: true,
        images: true
      }
    });

    const allVehicles = allVehiclesRaw.map(v => ({
      id: v.id,
      slug: v.slug,
      brandName: v.brand?.name,
      modelName: v.model?.name,
      version: v.version,
      year: v.year,
      city: v.city,
      price: v.price,
      status: v.status,
      isFeatured: v.isFeatured,
      createdAt: v.createdAt,
      userName: v.user?.name,
      userLastName: v.user?.lastName,
      userPhone: v.user?.phone,
      userEmail: v.user?.email,
      images: v.images
    }));

    return NextResponse.json(allVehicles);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehiclesTable.id, id),
      with: { user: true, brand: true, model: true }
    });

    if (!vehicle) return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });

    await db.update(vehiclesTable).set({ status }).where(eq(vehiclesTable.id, id));

    // Si el estado cambia a ACTIVO, enviar correo al usuario
    if (status === "ACTIVO" && vehicle.status !== "ACTIVO" && vehicle.user?.email) {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          
          await transporter.sendMail({
            from: `"Autos El Patrón" <${process.env.SMTP_USER}>`,
            to: vehicle.user.email,
            subject: `¡Tu vehículo ha sido Aprobado! - Autos El Patrón`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #cda434;">¡Felicidades ${vehicle.user.name || ''}!</h2>
                <p>Tu vehículo <strong>${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year}</strong> ha sido aprobado por nuestro equipo.</p>
                <p>Ya se encuentra publicado y visible para todos los compradores en nuestra plataforma.</p>
                <br/>
                <p>Si tienes alguna duda, puedes contactarnos respondiendo a este correo.</p>
                <p>Gracias por confiar en <strong>Autos El Patrón</strong>.</p>
              </div>
            `,
          });
          console.log("Correo de aprobación enviado a:", vehicle.user.email);
        } catch (error) {
          console.error("Error enviando correo de aprobación:", error);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await checkAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    await db.update(vehiclesTable).set({ status: 'ELIMINADO' }).where(eq(vehiclesTable.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
