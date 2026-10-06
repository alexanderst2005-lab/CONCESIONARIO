// Genera el PDF "ANTES" con la plantilla actual, simulando un usuario real que
// llenÃ³ todos los campos visibles del formulario (los ocultos quedan con sus defaults).
import { writeFileSync } from "fs";
import { generateFinancingPdfBuffer } from "./src/app/api/financing-requests/[id]/pdf/route";

// formData tal como lo envÃ­a hoy el frontend (useState inicial + lo que el usuario escribe)
const formData: any = {
  firstName: "Laura", secondName: "Marcela", lastName: "GÃ³mez", secondLastName: "RÃ­os",
  documentType: "Pasaporte", documentNumber: "AB123456", birthDate: "", birthCity: "",
  civilStatus: "SOLTERO", gender: "M",
  address: "Cra 15 # 45-20", city: "Cali", department: "", phone: "", mobile: "3001234567",
  email: "laura@example.com", housingType: "Arrendada", housingAntiquity: "",
  occupationType: "Independiente", profession: "", companyName: "DiseÃ±os LG",
  contractType: "INDEFINIDO", laborAntiquity: "", companyPhone: "",
  salary: "6500000", otherIncome: "", expenses: "2100000",
  spouseName: "", spouseDocument: "", refName: "Pedro RÃ­os", refCity: "", refMobile: "3109876543", refRelation: "TÃ­o",
};

// Mapeo idÃ©ntico al POST actual de /api/financing-requests
const request = {
  requestNumber: "SOL-2026-TEST",
  createdAt: new Date(),
  personalData: {
    firstName: formData.firstName || "", lastName: formData.lastName || "",
    documentType: formData.documentType || "", documentNumber: formData.documentNumber || "",
    dob: formData.birthDate || "", maritalStatus: formData.civilStatus || "",
    address: formData.address || "", city: formData.city || "", email: formData.email || "",
    phone: formData.mobile || formData.phone || "",
  },
  laborData: {
    activityType: formData.occupationType || "", occupation: formData.occupationType || "",
    company: formData.companyName || "", profession: formData.profession || "",
    salary: formData.salary || "", seniority: formData.laborAntiquity || "", otherIncome: formData.otherIncome || "",
  },
  financialData: { expenses: formData.expenses || "" },
  vehiclePrice: 54000000, downPayment: 10000000, financedAmount: 44000000,
  term: 60, rate: "1.5", estimatedMonthly: 1150000,
  bank: { name: "FINANDINA" },
  vehicle: { brand: { name: "Yamaha" }, model: { name: "MT-09" } },
};

generateFinancingPdfBuffer(request).then((bytes) => {
  writeFileSync(process.argv[2], Buffer.from(bytes));
  console.log("OK", process.argv[2]);
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });

