import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, city, phone } = await req.json();

    // Validar campos
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Separar nombre y apellido de forma básica
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Crear el usuario en la BD
    await db.insert(users).values({
      name: firstName,
      lastName: lastName,
      email: email,
      phone: phone || "",
      password: hashedPassword,
      city: city || "",
      role: "USER"
    });

    return NextResponse.json({ message: "Usuario creado exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ message: "Ocurrió un error al registrar el usuario" }, { status: 500 });
  }
}
