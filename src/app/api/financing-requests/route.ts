import { NextResponse } from "next/server";
import { db } from "@/db";
import { financingRequests } from "@/db/schema";
import { PDFDocument, rgb } from "pdf-lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { buildFinancingRequestData } from "@/lib/financingRequestData";

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
      formData,
      tipoSolicitud, rangoMin, rangoMax,
      idDocumentUrl
    } = body;

    const esLibre = tipoSolicitud === 'libre';

    if (!esLibre && (!vehicleId || !bankId)) {
      return NextResponse.json({ message: "Faltan parámetros del vehículo o banco" }, { status: 400 });
    }

    // Generar PDF (Básico por ahora, se mejorará con la plantilla real)
    // El PDF se generará dinámicamente cuando el admin haga clic en descargar
    const pdfUrl = "";

    // Guardar en Base de Datos
    const requestNumber = `SOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Solo se guardan los campos que el usuario realmente diligenció
    const { personalData, laborData, financialData } = buildFinancingRequestData(formData);

    const newRequest = await db.insert(financingRequests).values({
      requestNumber,
      userId,
      vehicleId: !esLibre ? (Number(vehicleId) || null) : null,
      bankId: !esLibre ? (Number(bankId) || null) : null,
      tipoSolicitud: esLibre ? 'libre' : 'vehiculo',
      rangoMin: esLibre ? (Number(rangoMin) || null) : null,
      rangoMax: esLibre ? (Number(rangoMax) || null) : null,
      personalData,
      laborData,
      financialData,
      vehiclePrice: Math.round(Number(vehiclePrice)) || 0,
      downPayment: Math.round(Number(downPayment)) || 0,
      financedAmount: Math.round(Number(financedAmount)) || 0,
      term: Math.round(Number(term)) || 0,
      rate: rate ? rate.toString() : "0",
      estimatedMonthly: Math.round(Number(estimatedMonthly)) || 0,
      status: "Pendiente",
      idDocumentUrl: idDocumentUrl || null,
    }).returning();

    // Actualizar con la URL del PDF dinámico
    await db.update(financingRequests)
      .set({ pdfUrl: `/api/financing-requests/${newRequest[0].id}/pdf` })
      .where(eq(financingRequests.id, newRequest[0].id));

    // Generar PDF y enviar por correo al concesionario
    try {
      const fullRequest = await db.query.financingRequests.findFirst({
        where: eq(financingRequests.id, newRequest[0].id),
        with: {
          bank: true,
          vehicle: {
            with: { brand: true, model: true }
          }
        }
      });

      if (fullRequest) {
        // Importación dinámica para no afectar la ejecución inicial
        const { generateFinancingPdfBuffer } = await import('./[id]/pdf/route');
        const pdfBytes = await generateFinancingPdfBuffer(fullRequest);
        
        const nodemailer = await import('nodemailer');
        
        // Configurar transporte usando variables de entorno o un fallback
        // Si no hay SMTP configurado, solo lo informamos por consola pero no falla
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
          const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

          const subject = esLibre 
            ? `Nueva Solicitud de Crédito Libre - ${requestNumber}`
            : `Nueva Solicitud de Crédito por Vehículo - ${requestNumber}`;
            
          const textMsg = esLibre
            ? `Se ha recibido una nueva solicitud de crédito libre. Adjunto encontrarás el documento PDF con todos los detalles.`
            : `Se ha recibido una nueva solicitud de crédito para el vehículo ${fullRequest.vehicle?.brand?.name || ''} ${fullRequest.vehicle?.model?.name || ''}. Adjunto encontrarás el documento PDF con todos los detalles.`;

          await transporter.sendMail({
            from: `"Autos El Patrón" <${fromEmail}>`,
            to: adminEmail,
            subject,
            text: textMsg,
            attachments: [
              {
                filename: `Solicitud_${requestNumber}.pdf`,
                content: Buffer.from(pdfBytes),
                contentType: 'application/pdf'
              }
            ]
          });
          console.log("Correo enviado correctamente al concesionario");
        } else {
          console.log("SMTP no configurado. El PDF fue generado pero no se envió por correo.");
        }
      }
    } catch (emailErr) {
      console.error("Error al generar o enviar el PDF por correo:", emailErr);
      // No bloqueamos la respuesta al cliente si el correo falla
    }

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
