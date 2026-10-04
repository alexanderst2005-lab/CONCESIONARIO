import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { PDFDocument, rgb } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const body = await req.json();
    const { 
      vehicleId, bankId, vehiclePrice, downPayment, financedAmount, 
      term, rate, estimatedMonthly, 
      formData
    } = body;

    if (!vehicleId || !bankId) {
      return NextResponse.json({ message: "Faltan parámetros del vehículo o banco" }, { status: 400 });
    }

    // Generar PDF (Básico por ahora, se mejorará con la plantilla real)
    // El PDF se generará dinámicamente cuando el admin haga clic en descargar
    const pdfUrl = "";

    // Guardar en Base de Datos
    const requestNumber = `SOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = await db.insert(financingRequests).values({
      requestNumber,
      userId,
      vehicleId: Number(vehicleId) || 0,
      bankId: Number(bankId) || 0,
      personalData: {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        documentType: formData.documentType || "",
        documentNumber: formData.documentNumber || "",
      },
      laborData: {
        occupation: formData.occupationType || "",
        company: formData.companyName || "",
        salary: formData.salary || "",
      },
      financialData: {
        expenses: formData.expenses || "",
      },
      vehiclePrice: Math.round(Number(vehiclePrice)) || 0,
      downPayment: Math.round(Number(downPayment)) || 0,
      financedAmount: Math.round(Number(financedAmount)) || 0,
      term: Math.round(Number(term)) || 0,
      rate: rate ? rate.toString() : "0",
      estimatedMonthly: Math.round(Number(estimatedMonthly)) || 0,
      status: "Pendiente",
    }).returning();

    // Actualizar con la URL del PDF dinámico
    await db.update(financingRequests)
      .set({ pdfUrl: `/api/financing-requests/${newRequest[0].id}/pdf` })
      .where(eq(financingRequests.id, newRequest[0].id));

    // Aquí iría el envío de correo al concesionario con el PDF adjunto

    return NextResponse.json({ 
      message: "Solicitud procesada correctamente", 
      requestNumber, 
      id: newRequest[0].id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error procesando solicitud de crédito:", error);
    return NextResponse.json({ message: "Error interno del servidor: " + (error as any).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allRequests = await db.query.financingRequests.findMany({
      with: {
        user: true,
        vehicle: true,
        bank: true
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)]
    });
    
    return NextResponse.json(allRequests);
  } catch (error) {
    console.error("Error fetching financing requests:", error);
    return NextResponse.json({ message: "Error al obtener solicitudes" }, { status: 500 });
  }
}
