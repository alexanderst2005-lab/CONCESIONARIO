import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
        vehicle: {
          with: {
            brand: true,
            model: true
          }
        }
      }
    });

    if (!request) {
      return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    }

    // Generar el PDF Profesional (Nivel Empresarial)
    const pdfDoc = await PDFDocument.create();
    
    // Fuentes estándar (Helvetica funciona bien sin cargar archivos externos en Vercel)
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const width = 595.28; // A4
    const height = 841.89; // A4
    let page = pdfDoc.addPage([width, height]);
    
    // Paleta de colores corporativa
    const colPrimary = rgb(0.78, 0.65, 0.25); // Dorado Autos El Patrón
    const colDark = rgb(0.12, 0.12, 0.12);
    const colText = rgb(0.2, 0.2, 0.2);
    const colTextLight = rgb(0.4, 0.4, 0.4);
    const colBg = rgb(0.96, 0.96, 0.96);
    const colBorder = rgb(0.85, 0.85, 0.85);

    let currentY = height;

    const checkPageBreak = (neededHeight: number) => {
      if (currentY - neededHeight < margin + 40) { // 40 for footer
        page = pdfDoc.addPage([width, height]);
        currentY = height - margin;
      }
    };

    const drawText = (text: string, x: number, y: number, font: any, size: number, color: any) => {
      page.drawText(text, { x, y, font, size, color });
    };

    // Cargar logo transparente
    const fs = require('fs');
    const path = require('path');
    let logoImg = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo_transparent.png');
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        logoImg = await pdfDoc.embedPng(logoBytes);
      }
    } catch (e) {
      console.error("Error loading logo:", e);
    }

    // 1. ENCABEZADO
    currentY -= 90; // Aumentar altura del header a 90
    page.drawRectangle({ x: 0, y: currentY, width: width, height: 90, color: colDark });
    
    if (logoImg) {
      const imgDims = logoImg.scaleToFit(140, 50);
      page.drawImage(logoImg, {
        x: margin,
        y: currentY + 20,
        width: imgDims.width,
        height: imgDims.height,
      });
      // Título debajo o al lado pero más pequeño/ajustado
      drawText('SOLICITUD DE FINANCIACIÓN DE VEHÍCULO', margin + imgDims.width + 15, currentY + 38, fontBold, 11, colPrimary);
    } else {
      drawText('AUTOS EL PATRÓN', margin, currentY + 45, fontBold, 22, colPrimary);
      drawText('SOLICITUD DE FINANCIACIÓN DE VEHÍCULO', margin, currentY + 25, fontReg, 10, rgb(1,1,1));
    }
    
    drawText(`No. Solicitud: ${request.requestNumber}`, width - margin - 150, currentY + 55, fontReg, 9, rgb(1,1,1));
    const reqDate = new Date(request.createdAt).toLocaleDateString('es-CO');
    drawText(`Fecha: ${reqDate}`, width - margin - 150, currentY + 35, fontReg, 9, rgb(1,1,1));

    currentY -= 20;

    // HELPERS DE DISEÑO
    const drawSectionHeader = (title: string) => {
      checkPageBreak(40);
      currentY -= 25;
      page.drawRectangle({ x: margin, y: currentY, width: width - margin * 2, height: 25, color: colBg, borderColor: colBorder, borderWidth: 1 });
      drawText(title, margin + 10, currentY + 8, fontBold, 10, colDark);
      currentY -= 15;
    };

    const drawGrid = (data: {label: string, value: string}[], cols: number) => {
      const colWidth = (width - margin * 2) / cols;
      let x = margin;
      let maxItemHeight = 35;
      
      checkPageBreak(maxItemHeight * Math.ceil(data.length / cols));

      data.forEach((item, index) => {
        if (index > 0 && index % cols === 0) {
          currentY -= maxItemHeight;
          x = margin;
        }
        drawText(item.label.toUpperCase(), x, currentY, fontBold, 8, colTextLight);
        drawText(item.value || 'No informado', x, currentY - 12, fontReg, 10, colText);
        x += colWidth;
      });
      currentY -= maxItemHeight;
    };

    // 01 — DATOS DEL SOLICITANTE
    const pd = request.personalData as any;
    drawSectionHeader('01 — DATOS DEL SOLICITANTE');
    drawGrid([
      { label: 'Nombre Completo', value: `${pd.firstName || ''} ${pd.lastName || ''}`.trim() },
      { label: 'Tipo Documento', value: pd.documentType },
      { label: 'No. Documento', value: pd.documentNumber },
      { label: 'Fecha Nacimiento', value: pd.dob || 'No informado' },
      { label: 'Estado Civil', value: pd.maritalStatus || 'No informado' },
      { label: 'Dirección', value: pd.address || 'No informado' },
      { label: 'Ciudad', value: pd.city || 'No informado' },
      { label: 'Correo', value: pd.email || 'No informado' },
      { label: 'Teléfono', value: pd.phone || 'No informado' }
    ], 3);

    // 02 — INFORMACIÓN LABORAL Y ECONÓMICA
    const ld = request.laborData as any;
    drawSectionHeader('02 — INFORMACIÓN LABORAL Y ECONÓMICA');
    drawGrid([
      { label: 'Actividad', value: ld.activityType || 'No informado' },
      { label: 'Ocupación', value: ld.occupation || 'No informado' },
      { label: 'Empresa', value: ld.company || 'No informado' },
      { label: 'Profesión', value: ld.profession || 'No informado' },
      { label: 'Ingresos', value: ld.salary ? `$${Number(ld.salary).toLocaleString('es-CO')}` : 'No informado' },
      { label: 'Antigüedad', value: ld.seniority || 'No informado' },
      { label: 'Otros Ingresos', value: ld.otherIncome ? `$${Number(ld.otherIncome).toLocaleString('es-CO')}` : 'No informado' },
      { label: 'Egresos', value: (request.financialData as any)?.expenses ? `$${Number((request.financialData as any).expenses).toLocaleString('es-CO')}` : 'No informado' }
    ], 3);

    // 03 — VEHÍCULO
    const reqAny = request as any;
    const vBrand = reqAny.vehicle?.brand?.name || 'No informado';
    const vModel = reqAny.vehicle?.model?.name || 'No informado';
    drawSectionHeader('03 — VEHÍCULO');
    drawGrid([
      { label: 'Marca', value: vBrand },
      { label: 'Modelo / Línea', value: vModel },
      { label: 'Año', value: 'No informado' },
      { label: 'Tipo', value: 'Automóvil' },
      { label: 'Placa', value: 'No informado' },
      { label: 'Precio', value: `$${request.vehiclePrice.toLocaleString('es-CO')}` }
    ], 3);

    // 04 — RESUMEN DE FINANCIACIÓN
    drawSectionHeader('04 — RESUMEN DE FINANCIACIÓN');
    
    currentY -= 5;
    checkPageBreak(90);
    
    // Caja resaltada principal
    const summaryBoxY = currentY - 80;
    page.drawRectangle({ x: margin, y: summaryBoxY, width: width - margin * 2, height: 80, color: colBg, borderColor: colBorder, borderWidth: 1 });
    
    drawText('PRECIO DEL VEHÍCULO', margin + 15, summaryBoxY + 60, fontBold, 8, colTextLight);
    drawText(`$${request.vehiclePrice.toLocaleString('es-CO')}`, margin + 15, summaryBoxY + 45, fontBold, 11, colText);

    drawText('CUOTA INICIAL', margin + 140, summaryBoxY + 60, fontBold, 8, colTextLight);
    drawText(`$${request.downPayment.toLocaleString('es-CO')}`, margin + 140, summaryBoxY + 45, fontBold, 11, colText);

    drawText('MONTO A FINANCIAR', margin + 250, summaryBoxY + 60, fontBold, 8, colTextLight);
    drawText(`$${request.financedAmount.toLocaleString('es-CO')}`, margin + 250, summaryBoxY + 45, fontBold, 11, colText);

    const downPercent = request.vehiclePrice > 0 ? Math.round((request.downPayment / request.vehiclePrice) * 100) : 0;
    drawText(`Porcentaje inicial: ${downPercent}%`, margin + 15, summaryBoxY + 15, fontReg, 9, colTextLight);
    drawText(`Entidad: ${request.bank?.name || 'N/A'}`, margin + 140, summaryBoxY + 15, fontReg, 9, colTextLight);
    drawText(`Plazo: ${request.term} meses`, margin + 250, summaryBoxY + 15, fontReg, 9, colTextLight);

    // Caja oscura de cuota estimada
    const boxW = 150;
    page.drawRectangle({ x: width - margin - boxW, y: summaryBoxY, width: boxW, height: 80, color: colDark });
    drawText('CUOTA ESTIMADA', width - margin - boxW + 15, summaryBoxY + 60, fontBold, 8, colPrimary);
    drawText(`$${request.estimatedMonthly.toLocaleString('es-CO')}`, width - margin - boxW + 15, summaryBoxY + 35, fontBold, 15, rgb(1,1,1));

    currentY = summaryBoxY - 20;

    drawText('La cuota presentada corresponde a una simulación y está sujeta a aprobación de la entidad financiera.', margin, currentY, fontReg, 8, colTextLight);
    
    currentY -= 30;

    // 05 — DOCUMENTACIÓN Y DECLARACIÓN
    drawSectionHeader('05 — DOCUMENTACIÓN Y DECLARACIÓN');
    
    drawText('Documento de Identidad:', margin, currentY, fontBold, 9, colText);
    drawText(`Adjuntado en el sistema (C.C. ${pd.documentNumber})`, margin + 130, currentY, fontReg, 9, colTextLight);
    currentY -= 20;

    const disclaimer = 'La información suministrada por el solicitante corresponde a los datos registrados durante el proceso de solicitud y será utilizada para la gestión y evaluación de la financiación solicitada. Al firmar este documento, el solicitante autoriza el tratamiento de sus datos personales bajo las leyes vigentes.';
    
    // Wrapping manual básico del disclaimer
    const words = disclaimer.split(' ');
    let line = '';
    for (let word of words) {
      if ((line + word).length > 100) {
        drawText(line, margin, currentY, fontReg, 8, colTextLight);
        currentY -= 12;
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    }
    drawText(line, margin, currentY, fontReg, 8, colTextLight);

    currentY -= 50;
    
    checkPageBreak(80); // Reducir el threshold para que no deje tanto espacio en blanco si cabe justo

    // Bloque de Firma
    page.drawLine({ start: { x: margin, y: currentY }, end: { x: margin + 200, y: currentY }, color: colDark, thickness: 1 });
    drawText('Firma del solicitante', margin, currentY - 15, fontBold, 9, colText);
    drawText(`Nombre: ${pd.firstName || ''} ${pd.lastName || ''}`.trim(), margin, currentY - 28, fontReg, 9, colText);
    drawText(`C.C.: ${pd.documentNumber || ''}`, margin, currentY - 40, fontReg, 9, colText);

    // PIE DE PÁGINA GLOBAL
    const pages = pdfDoc.getPages();
    pages.forEach((p, i) => {
      p.drawLine({ start: { x: margin, y: 40 }, end: { x: width - margin, y: 40 }, color: colBorder, thickness: 1 });
      p.drawText(`Autos El Patrón · Solicitud ${request.requestNumber}`, { x: margin, y: 25, font: fontReg, size: 8, color: colTextLight });
      p.drawText(`Fecha de impresión: ${new Date().toLocaleDateString('es-CO')}`, { x: width / 2 - 50, y: 25, font: fontReg, size: 8, color: colTextLight });
      p.drawText(`Página ${i + 1} de ${pages.length}`, { x: width - margin - 40, y: 25, font: fontReg, size: 8, color: colTextLight });
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
