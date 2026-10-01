const fs = require('fs');
let code = fs.readFileSync('src/app/api/vehicles/route.ts', 'utf8');

const insertOld = `      engineCapacity: parseInt(data.engineCapacity) || 0,
      
      price: parseInt(data.price) || 0,
      city: data.city || "Bogotá",
      plate: data.plate || "",
      description: data.description || "",
      
      // Todo vehículo entra como PENDIENTE de aprobación por el Admin
      status: "PENDIENTE",`;

const insertNew = `      engineCapacity: parseInt(data.engineCapacity) || 0,
      
      price: parseInt(data.price) || 0,
      city: data.city || "Bogotá",
      plate: data.plate || "",
      description: data.description || "",
      
      color: data.color || "",
      soat: data.soat === "true",
      tecnomecanica: data.tecnomecanica === "true",
      ownersCount: parseInt(data.ownersCount) || 1,
      prenda: data.prenda === "true",
      accessories: data.accessories || "",
      hasGas: data.hasGas === "true",
      hasGps: data.hasGps === "true",
      locationStatus: data.locationStatus || "Vitrina",
      cityRegistered: data.cityRegistered || "",

      // Todo vehículo entra como PENDIENTE de aprobación por el Admin
      status: "PENDIENTE",`;

code = code.replace(insertOld, insertNew);

// Also apply for PUT method
const putOld = `        engineCapacity: parseInt(data.engineCapacity) || 0,
        price: parseInt(data.price) || 0,
        city: data.city || "",
        plate: data.plate || "",
        description: data.description || "",
        status: data.status || undefined // Solo lo puede cambiar admin, o se reinicia
      })`;

const putNew = `        engineCapacity: parseInt(data.engineCapacity) || 0,
        price: parseInt(data.price) || 0,
        city: data.city || "",
        plate: data.plate || "",
        description: data.description || "",
        
        color: data.color || "",
        soat: data.soat === "true" || data.soat === true,
        tecnomecanica: data.tecnomecanica === "true" || data.tecnomecanica === true,
        ownersCount: parseInt(data.ownersCount) || 1,
        prenda: data.prenda === "true" || data.prenda === true,
        accessories: data.accessories || "",
        hasGas: data.hasGas === "true" || data.hasGas === true,
        hasGps: data.hasGps === "true" || data.hasGps === true,
        locationStatus: data.locationStatus || "Vitrina",
        cityRegistered: data.cityRegistered || "",

        status: data.status || undefined // Solo lo puede cambiar admin, o se reinicia
      })`;

code = code.replace(putOld, putNew);

fs.writeFileSync('src/app/api/vehicles/route.ts', code);
