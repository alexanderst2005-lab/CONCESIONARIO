import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditVehicleForm from "./EditVehicleForm";

export default async function EditarVehiculoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const vehicleRecord = await db.query.vehicles.findFirst({
    where: eq(vehicles.slug, slug),
    with: {
      brand: true,
      model: true,
      images: true,
      features: true
    }
  });

  if (!vehicleRecord) {
    notFound();
  }

  // Pre-fill data
  const initialData = {
    id: vehicleRecord.id,
    brandName: vehicleRecord.brand?.name || "",
    modelName: vehicleRecord.model?.name || "",
    version: vehicleRecord.version || "",
    year: vehicleRecord.year?.toString() || "",
    mileage: vehicleRecord.mileage?.toString() || "",
    fuelType: vehicleRecord.fuelType || "",
    transmission: vehicleRecord.transmission || "",
    engineCapacity: vehicleRecord.engineCapacity?.toString() || "",
    price: vehicleRecord.price?.toString() || "",
    city: vehicleRecord.city || "",
    plate: vehicleRecord.plate || "",
    description: vehicleRecord.description || "",
    color: vehicleRecord.color || "",
    soat: vehicleRecord.soat || "",
    tecnomecanica: vehicleRecord.tecnomecanica || "",
    prenda: vehicleRecord.prenda || "No",
    ownersCount: vehicleRecord.ownersCount?.toString() || "1",
    existingImages: vehicleRecord.images?.map(img => img.url) || []
  };

  return <EditVehicleForm initialData={initialData} />;
}
