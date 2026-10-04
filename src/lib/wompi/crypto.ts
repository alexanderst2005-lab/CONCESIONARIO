import crypto from 'crypto';

/**
 * Calcula la firma de integridad de Wompi.
 * Se usa para generar la firma antes de enviar el usuario al widget.
 */
export function generarFirmaIntegridad(referencia: string, montoEnCentavos: number, moneda: string = 'COP'): string {
  const secreto = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secreto) throw new Error('WOMPI_INTEGRITY_SECRET no está configurado');
  
  const cadena = `${referencia}${montoEnCentavos}${moneda}${secreto}`;
  return crypto.createHash('sha256').update(cadena).digest('hex');
}

/**
 * Valida el checksum enviado por Wompi en el webhook.
 * (Eventos de la API de Wompi).
 */
export function validarFirmaWebhook(data: any): boolean {
  const signatureEnvio = data?.signature?.checksum;
  if (!signatureEnvio) return false;

  const secreto = process.env.WOMPI_EVENT_SECRET;
  if (!secreto) {
    console.error('WOMPI_EVENT_SECRET no está configurado');
    return false;
  }

  // Las propiedades a concatenar dependen del evento de Wompi.
  // Para transaction.updated, Wompi envía estas propiedades en la firma.
  const properties = data?.signature?.properties || [];
  
  let cadena = '';
  for (const prop of properties) {
    const keys = prop.split('.');
    let val = data.data;
    for (const key of keys) {
      val = val ? val[key] : undefined;
    }
    cadena += (val !== undefined && val !== null) ? val.toString() : '';
  }
  
  cadena += `${data.timestamp}${secreto}`;
  
  const checksumCalculado = crypto.createHash('sha256').update(cadena).digest('hex');
  return checksumCalculado === signatureEnvio;
}
