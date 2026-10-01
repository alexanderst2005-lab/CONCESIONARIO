const fs = require('fs');

let apiContent = fs.readFileSync('src/app/api/vehicles/route.ts', 'utf8');

if (!apiContent.includes('vehicleImages')) {
  apiContent = apiContent.replace(/import \{ vehicles, brands, models, categories \} from "@\/db\/schema";/, 'import { vehicles, brands, models, categories, vehicleImages } from "@/db/schema";');
}

const insertImagesCode = `
    const newVehicleRecord = newVehicle;

    // 3. Save images if any
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageRecords = data.images.map((url, index) => ({
        vehicleId: newVehicleRecord.id,
        url: url,
        isMain: index === 0,
        order: index
      }));
      await db.insert(vehicleImages).values(imageRecords);
    }

    return NextResponse.json({ message: "Vehículo publicado exitosamente", vehicleId: newVehicleRecord.id }, { status: 201 });
`;

apiContent = apiContent.replace(/return NextResponse\.json\(\{ message: "Vehículo publicado exitosamente", vehicleId: newVehicle\.id \}, \{ status: 201 \}\);/, insertImagesCode);

fs.writeFileSync('src/app/api/vehicles/route.ts', apiContent, 'utf8');
console.log("Updated API route");
