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

    // Generar el PDF Profesional
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    
    // Colores corporativos
    const goldColor = rgb(0.8, 0.64, 0.2); // Aprox #cda434
    const darkColor = rgb(0.1, 0.1, 0.1);
    const lightGray = rgb(0.95, 0.95, 0.95);
    const textColor = rgb(0.2, 0.2, 0.2);

    // Encabezado
    page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: darkColor });
    page.drawText('AUTOS EL PATRÓN', { x: 50, y: height - 45, size: 28, color: goldColor });
    page.drawText('SOLICITUD DE CRÉDITO', { x: 50, y: height - 70, size: 14, color: rgb(1, 1, 1) });
    
    page.drawText(`No. Solicitud: ${request.requestNumber}`, { x: width - 200, y: height - 50, size: 12, color: rgb(1, 1, 1) });
    page.drawText(`Fecha: ${new Date(request.createdAt).toLocaleDateString('es-CO')}`, { x: width - 200, y: height - 70, size: 12, color: rgb(1, 1, 1) });

    let currentY = height - 140;

    const drawSection = (title: string, data: [string, string | number][]) => {
      // Fondo de sección
      page.drawRectangle({ x: 40, y: currentY - 15, width: width - 80, height: 25, color: goldColor });
      page.drawText(title, { x: 50, y: currentY - 10, size: 12, color: darkColor });
      currentY -= 40;

      // Datos en dos columnas
      data.forEach((item, index) => {
        const xPos = index % 2 === 0 ? 50 : width / 2 + 10;
        
        page.drawText(`${item[0]}:`, { x: xPos, y: currentY, size: 10, color: rgb(0.4, 0.4, 0.4) });
        page.drawText(String(item[1]), { x: xPos + 120, y: currentY, size: 10, color: textColor });
        
        if (index % 2 !== 0) currentY -= 25;
      });
      if (data.length % 2 !== 0) currentY -= 25;
      currentY -= 15;
    };

    const pd = request.personalData as any;
    drawSection('DATOS DEL SOLICITANTE', [
      ['Nombres', pd.firstName],
      ['Apellidos', pd.lastName],
      ['Tipo Ident.', pd.documentType],
      ['Número Ident.', pd.documentNumber]
    ]);

    const ld = request.laborData as any;
    drawSection('INFORMACIÓN LABORAL', [
      ['Ocupación', ld.occupation],
      ['Empresa', ld.company],
      ['Ingresos Mensuales', `$${Number(ld.salary).toLocaleString('es-CO')}`]
    ]);

    drawSection('DATOS DEL VEHÍCULO Y CRÉDITO', [
      ['Vehículo', request.vehicle ? `${request.vehicle.brand?.name} ${request.vehicle.model?.name}` : 'N/A'],
      ['Precio Venta', `$${request.vehiclePrice.toLocaleString('es-CO')}`],
      ['Cuota Inicial', `$${request.downPayment.toLocaleString('es-CO')}`],
      ['Monto a Financiar', `$${request.financedAmount.toLocaleString('es-CO')}`],
      ['Entidad', request.bank?.name || 'N/A'],
      ['Plazo', `${request.term} meses`],
      ['Cuota Estimada', `$${request.estimatedMonthly.toLocaleString('es-CO')}`]
    ]);

    // Pie de página (Firmas)
    currentY -= 50;
    page.drawLine({ start: { x: 50, y: currentY }, end: { x: 250, y: currentY }, thickness: 1, color: darkColor });
    page.drawText('Firma del Solicitante', { x: 90, y: currentY - 20, size: 10, color: textColor });
    page.drawText(`C.C. ${pd.documentNumber}`, { x: 100, y: currentY - 35, size: 10, color: textColor });

    page.drawLine({ start: { x: 350, y: currentY }, end: { x: 550, y: currentY }, thickness: 1, color: darkColor });
    page.drawText('Huella Dactilar', { x: 410, y: currentY - 20, size: 10, color: textColor });

    // Disclaimer
    page.drawText('Este documento es generado automáticamente por la plataforma Autos El Patrón. Todos los datos están sujetos a verificación.', { 
      x: 50, y: 30, size: 8, color: rgb(0.5, 0.5, 0.5) 
    });

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
