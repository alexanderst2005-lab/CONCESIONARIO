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

    const pdfBytes = await generateFinancingPdfBuffer(request);

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

/** Devuelve el texto limpio o undefined si está vacío (para omitir el campo del PDF). */
const val = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

/** Formatea un monto escrito por el usuario. Si no es numérico, se imprime tal cual. */
const money = (v: unknown): string | undefined => {
  const s = val(v);
  if (!s) return undefined;
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return s;
  return `$${Number(digits).toLocaleString('es-CO')}`;
};

export async function generateFinancingPdfBuffer(request: any) {
    // Generar el PDF Profesional (Nivel Empresarial)
    const pdfDoc = await PDFDocument.create();
    
    // Fuentes estándar (Helvetica funciona bien sin cargar archivos externos en Vercel)
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 40;
    const width = 595.28; // A4
    const height = 841.89; // A4
    const contentWidth = width - margin * 2;
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

    /** Ajusta el texto al ancho disponible: reduce la fuente y, si no alcanza, lo recorta con "…". */
    const fitText = (text: string, font: any, size: number, maxWidth: number) => {
      let s = size;
      while (s > 7 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 0.5;
      let t = text;
      if (font.widthOfTextAtSize(t, s) > maxWidth) {
        while (t.length > 1 && font.widthOfTextAtSize(t + '…', s) > maxWidth) t = t.slice(0, -1);
        t = t + '…';
      }
      return { text: t, size: s };
    };

    /** Escribe un párrafo con salto de línea según el ancho real del texto. */
    const drawParagraph = (text: string, size: number, color: any, lineHeight = 12) => {
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (fontReg.widthOfTextAtSize(test, size) > contentWidth) {
          checkPageBreak(lineHeight);
          drawText(line, margin, currentY, fontReg, size, color);
          currentY -= lineHeight;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) {
        checkPageBreak(lineHeight);
        drawText(line, margin, currentY, fontReg, size, color);
        currentY -= lineHeight;
      }
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
    // Las secciones se numeran según las que realmente se imprimen, para que no
    // queden saltos (01, 02, 04…) cuando una sección se omite por falta de datos.
    let sectionNumber = 0;
    const drawSectionHeader = (title: string) => {
      sectionNumber += 1;
      checkPageBreak(40);
      currentY -= 25;
      page.drawRectangle({ x: margin, y: currentY, width: contentWidth, height: 25, color: colBg, borderColor: colBorder, borderWidth: 1 });
      drawText(`${String(sectionNumber).padStart(2, '0')} — ${title}`, margin + 10, currentY + 8, fontBold, 10, colDark);
      currentY -= 15;
    };

    type Field = { label: string, value?: string };

    /**
     * Dibuja una cuadrícula SOLO con los campos que tienen valor. Los campos vacíos
     * no se dibujan ni dejan hueco: los siguientes se corren para ocupar su lugar.
     */
    const drawGrid = (data: Field[], cols: number) => {
      const filled = data.filter(f => !!f.value);
      if (filled.length === 0) return;
      const colWidth = contentWidth / cols;
      const rowHeight = 32;
      const rows = Math.ceil(filled.length / cols);
      checkPageBreak(rowHeight * rows);

      filled.forEach((item, index) => {
        const col = index % cols;
        if (index > 0 && col === 0) currentY -= rowHeight;
        const x = margin + col * colWidth;
        const label = fitText(item.label.toUpperCase(), fontBold, 8, colWidth - 10);
        const value = fitText(item.value!, fontReg, 10, colWidth - 10);
        drawText(label.text, x, currentY, fontBold, label.size, colTextLight);
        drawText(value.text, x, currentY - 12, fontReg, value.size, colText);
      });
      currentY -= rowHeight;
    };

    const hasAny = (data: Field[]) => data.some(f => !!f.value);

    const pd = (request.personalData || {}) as any;
    const ld = (request.laborData || {}) as any;
    const fd = (request.financialData || {}) as any;
    const ref = (pd.reference || {}) as any;
    const reqAny = request as any;

    const fullName = [pd.firstName, pd.secondName, pd.lastName, pd.secondLastName].map(val).filter(Boolean).join(' ');
    const docType = val(pd.documentType);
    const docNumber = val(pd.documentNumber);

    // DATOS DEL SOLICITANTE
    // Solo campos que el formulario actual recolecta. Campos de versiones anteriores
    // (fecha de nacimiento, estado civil, etc.) ya no se imprimen aunque existan en BD.
    const personalFields: Field[] = [
      { label: 'Nombre Completo', value: val(fullName) },
      { label: 'Tipo Documento', value: docType },
      { label: 'No. Documento', value: docNumber },
      { label: 'Dirección', value: val(pd.address) },
      { label: 'Ciudad', value: val(pd.city) },
      { label: 'Celular', value: val(pd.phone) },
      { label: 'Correo', value: val(pd.email) },
      { label: 'Tipo de Vivienda', value: val(pd.housingType) },
    ];
    if (hasAny(personalFields)) {
      drawSectionHeader('DATOS DEL SOLICITANTE');
      drawGrid(personalFields, 3);
    }

    // INFORMACIÓN LABORAL Y ECONÓMICA
    const laborFields: Field[] = [
      { label: 'Ocupación', value: val(ld.activityType) },
      { label: 'Empresa', value: val(ld.company) },
      { label: 'Ingresos Mensuales', value: money(ld.salary) },
      { label: 'Egresos Mensuales', value: money(fd.expenses) },
    ];
    if (hasAny(laborFields)) {
      drawSectionHeader('INFORMACIÓN LABORAL Y ECONÓMICA');
      drawGrid(laborFields, 3);
    }

    // VEHÍCULO (datos reales del vehículo seleccionado, nada quemado)
    if (reqAny.tipoSolicitud !== 'libre') {
      const vehicleFields: Field[] = [
        { label: 'Marca', value: val(reqAny.vehicle?.brand?.name) },
        { label: 'Modelo / Línea', value: val(reqAny.vehicle?.model?.name) },
        { label: 'Año', value: val(reqAny.vehicle?.year) },
      ];
      if (hasAny(vehicleFields)) {
        drawSectionHeader('VEHÍCULO');
        drawGrid(vehicleFields, 3);
      }
    }

    // RESUMEN DE FINANCIACIÓN
    drawSectionHeader('RESUMEN DE FINANCIACIÓN');
    
    if (reqAny.tipoSolicitud === 'libre') {
      let rangoStr = '';
      if (reqAny.rangoMin && reqAny.rangoMax) {
        rangoStr = `De ${money(reqAny.rangoMin)} a ${money(reqAny.rangoMax)}`;
      } else if (reqAny.rangoMin) {
        rangoStr = `${money(reqAny.rangoMin)} en adelante`;
      }

      const financeFields: Field[] = [
        { label: 'Rango de Vehículo', value: val(rangoStr) },
        { label: 'Cuota Inicial Disponible', value: money(reqAny.downPayment) },
        { label: 'Plazo Estimado', value: reqAny.term ? `${reqAny.term} meses` : undefined },
      ];
      drawGrid(financeFields, 3);
    } else {
      // Flujo Vehículo: campos vacíos para llenar a mano
      currentY -= 5;
      checkPageBreak(70);
      const summaryH = 60;
      const summaryBoxY = currentY - summaryH;
      page.drawRectangle({ x: margin, y: summaryBoxY, width: contentWidth, height: summaryH, color: colBg, borderColor: colBorder, borderWidth: 1 });
      const summaryLabels = ['PRECIO DEL VEHÍCULO', 'CUOTA INICIAL', 'MONTO A FINANCIAR'];
      const summaryColW = contentWidth / summaryLabels.length;
      summaryLabels.forEach((label, i) => {
        const x = margin + i * summaryColW + 15;
        drawText(label, x, summaryBoxY + summaryH - 20, fontBold, 8, colTextLight);
        // Línea en blanco para diligenciar a mano
        page.drawLine({ start: { x, y: summaryBoxY + 15 }, end: { x: x + summaryColW - 30, y: summaryBoxY + 15 }, color: colBorder, thickness: 1 });
        drawText('$', x, summaryBoxY + 19, fontReg, 10, colTextLight);
      });
      currentY = summaryBoxY - 10;
    }

    // REFERENCIA PERSONAL
    const refFields: Field[] = [
      { label: 'Nombre', value: val(ref.name) },
      { label: 'Celular', value: val(ref.mobile) },
      { label: 'Parentesco', value: val(ref.relation) },
    ];
    if (hasAny(refFields)) {
      drawSectionHeader('REFERENCIA PERSONAL');
      drawGrid(refFields, 3);
    }

    // DOCUMENTACIÓN Y DECLARACIÓN
    drawSectionHeader('DOCUMENTACIÓN Y DECLARACIÓN');
    drawText('Documento de identidad:', margin, currentY, fontBold, 9, colText);
    drawText('Pendiente de entrega física', margin + 120, currentY, fontReg, 9, colTextLight);
    currentY -= 20;

    const disclaimer = 'La información suministrada por el solicitante corresponde a los datos registrados durante el proceso de solicitud y será utilizada para la gestión y evaluación de la financiación solicitada. Al firmar este documento, el solicitante autoriza el tratamiento de sus datos personales bajo las leyes vigentes.';
    drawParagraph(disclaimer, 8, colTextLight);

    // BLOQUE DE CIERRE: FIRMA + HUELLA (mismo bloque, alineados)
    const fpW = 71;  // ≈ 2.5 cm
    const fpH = 85;  // ≈ 3 cm
    const blockH = fpH + 30;
    currentY -= 20;
    checkPageBreak(blockH);

    const fpTop = currentY;
    const fpBottom = fpTop - fpH;
    const fpX = margin + 270;

    // Firma: espacio a la izquierda, línea alineada con la parte baja de la huella
    const sigLineY = fpBottom + 30;
    const sigW = 220;
    page.drawLine({ start: { x: margin, y: sigLineY }, end: { x: margin + sigW, y: sigLineY }, color: colDark, thickness: 1 });
    drawText('Firma del solicitante', margin, sigLineY - 13, fontBold, 9, colText);
    if (fullName) drawText(fitText(`Nombre: ${fullName}`, fontReg, 9, sigW).text, margin, sigLineY - 25, fontReg, 9, colText);
    if (docNumber) drawText(`${docType || 'Documento'}: ${docNumber}`, margin, sigLineY - 37, fontReg, 9, colText);

    // Huella: recuadro al lado de la firma
    page.drawRectangle({ x: fpX, y: fpBottom, width: fpW, height: fpH, borderColor: colDark, borderWidth: 1 });
    const fpLabel = 'Huella del solicitante';
    const fpLabelW = fontBold.widthOfTextAtSize(fpLabel, 9);
    drawText(fpLabel, fpX + fpW / 2 - fpLabelW / 2, fpBottom - 13, fontBold, 9, colText);

    currentY = fpBottom - 25;

    // PIE DE PÁGINA GLOBAL
    const pages = pdfDoc.getPages();
    pages.forEach((p, i) => {
      p.drawLine({ start: { x: margin, y: 40 }, end: { x: width - margin, y: 40 }, color: colBorder, thickness: 1 });
      p.drawText(`Autos El Patrón · Solicitud ${request.requestNumber}`, { x: margin, y: 25, font: fontReg, size: 8, color: colTextLight });
      p.drawText(`Fecha de impresión: ${new Date().toLocaleDateString('es-CO')}`, { x: width / 2 - 50, y: 25, font: fontReg, size: 8, color: colTextLight });
      p.drawText(`Página ${i + 1} de ${pages.length}`, { x: width - margin - 40, y: 25, font: fontReg, size: 8, color: colTextLight });
    });

    return await pdfDoc.save();
}
