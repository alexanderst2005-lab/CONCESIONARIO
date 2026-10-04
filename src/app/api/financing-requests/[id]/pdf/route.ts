import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PDFDocument, rgb } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Buscar la solicitud
    const request = await db.query.financingRequests.findFirst({
      where: eq(financingRequests.id, Number(id)),
      with: {
        bank: true,
      }
    });

    if (!request) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }

    // Generar el PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Aquí pintamos los datos sobre el PDF
    page.drawText('SOLICITUD DE CRÉDITO DE VEHÍCULO', { x: 50, y: height - 50, size: 20 });
    
    // Datos Personales
    const pd = request.personalData as any;
    page.drawText(`Nombres: ${pd.firstName} ${pd.lastName}`, { x: 50, y: height - 100, size: 12 });
    page.drawText(`Identificación: ${pd.documentType} ${pd.documentNumber}`, { x: 50, y: height - 120, size: 12 });
    
    // Datos Financieros
    page.drawText(`Monto a Financiar: $${request.financedAmount.toLocaleString('es-CO')}`, { x: 50, y: height - 160, size: 12 });
    page.drawText(`Plazo: ${request.term} meses`, { x: 50, y: height - 180, size: 12 });
    page.drawText(`Entidad: ${request.bank?.name || 'Banco'}`, { x: 50, y: height - 200, size: 12 });
    page.drawText(`Cuota Mensual Estimada: $${request.estimatedMonthly.toLocaleString('es-CO')}`, { x: 50, y: height - 220, size: 12 });
    
    // Información Laboral
    const ld = request.laborData as any;
    page.drawText(`Ocupación: ${ld.occupation}`, { x: 50, y: height - 260, size: 12 });
    page.drawText(`Empresa: ${ld.company}`, { x: 50, y: height - 280, size: 12 });
    page.drawText(`Ingresos: $${Number(ld.salary).toLocaleString('es-CO')}`, { x: 50, y: height - 300, size: 12 });

    const pdfBytes = await pdfDoc.save();

    // Retornar el PDF como un archivo descargable
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Solicitud_${request.requestNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error al generar PDF:", error);
    return NextResponse.json({ message: "Error interno al generar el PDF" }, { status: 500 });
  }
}
