/**
 * Construye los objetos JSON que se guardan en `financing_requests` a partir del
 * formulario de /solicitud-credito.
 *
 * Regla: solo se guarda lo que el usuario realmente diligenció. Los valores vacíos
 * se omiten (no se rellenan con "" ni con valores por defecto), así el PDF puede
 * saber con certeza qué campos se llenaron.
 */

const clean = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

/** Elimina las claves con valor `undefined` (y objetos anidados que queden vacíos). */
const compact = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = compact(v);
      if (Object.keys(inner).length === 0) continue;
      out[k] = inner;
    } else {
      out[k] = v;
    }
  }
  return out as Partial<T>;
};

export function buildFinancingRequestData(formData: Record<string, any> = {}) {
  const personalData = compact({
    firstName: clean(formData.firstName),
    secondName: clean(formData.secondName),
    lastName: clean(formData.lastName),
    secondLastName: clean(formData.secondLastName),
    documentType: clean(formData.documentType),
    documentNumber: clean(formData.documentNumber),
    address: clean(formData.address),
    city: clean(formData.city),
    phone: clean(formData.mobile),
    email: clean(formData.email),
    housingType: clean(formData.housingType),
    reference: {
      name: clean(formData.refName),
      mobile: clean(formData.refMobile),
      relation: clean(formData.refRelation),
    },
  });

  const laborData = compact({
    activityType: clean(formData.occupationType),
    company: clean(formData.companyName),
    salary: clean(formData.salary),
  });

  const financialData = compact({
    expenses: clean(formData.expenses),
  });

  return { personalData, laborData, financialData };
}
