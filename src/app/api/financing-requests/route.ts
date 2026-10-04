import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { PDFDocument, rgb } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    page.drawText('SOLICITUD DE CRÉDITO DE VEHÍCULO', { x: 50, y: height - 50, size: 20 });
    page.drawText(`Cliente: ${formData.firstName} ${formData.lastName}`, { x: 50, y: height - 100, size: 12 });
    page.drawText(`Cédula: ${formData.documentNumber}`, { x: 50, y: height - 120, size: 12 });
    page.drawText(`Monto a Financiar: $${financedAmount}`, { x: 50, y: height - 140, size: 12 });
    page.drawText(`Plazo: ${term} meses`, { x: 50, y: height - 160, size: 12 });
    page.drawText(`Entidad: Banco #${bankId}`, { x: 50, y: height - 180, size: 12 });
    
    // Aquí idealmente guardaríamos el PDF en Vercel Blob o AWS S3
    // Por ahora, simularemos que se guardó
    // const pdfBytes = await pdfDoc.save();
    const pdfUrl = "https://example.com/pdf/simulado.pdf";

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
      vehiclePrice: Number(vehiclePrice) || 0,
      downPayment: Number(downPayment) || 0,
      financedAmount: Number(financedAmount) || 0,
      term: Number(term) || 0,
      rate: rate ? rate.toString() : "0",
      estimatedMonthly: Number(estimatedMonthly) || 0,
      status: "Pendiente",
      pdfUrl: pdfUrl
    }).returning();

    // Aquí iría el envío de correo al concesionario con el PDF adjunto

    return NextResponse.json({ 
      message: "Solicitud procesada correctamente", 
      requestNumber, 
      id: newRequest[0].id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error procesando solicitud de crédito:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
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
