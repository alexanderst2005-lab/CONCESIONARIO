"use client";
import { useEffect } from "react";

export default function HistoryTracker({ vehicle }: { vehicle: any }) {
  useEffect(() => {
    if (!vehicle) return;
    
    try {
      const stored = localStorage.getItem("vehicleHistory");
      let history = stored ? JSON.parse(stored) : [];
      
      // Remove if exists to put it at the top
      history = history.filter((v: any) => v.slug !== vehicle.slug);
      
      // Add to beginning
      history.unshift({
        slug: vehicle.slug,
        brandName: vehicle.brandName || "Desconocida",
        modelName: vehicle.modelName || "Desconocido",
        year: vehicle.year || "-",
        city: vehicle.city || "-",
        price: vehicle.price || 0,
        image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0].url : "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop"
      });
      
      // Keep only last 10
      if (history.length > 10) history = history.slice(0, 10);
      
      localStorage.setItem("vehicleHistory", JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [vehicle]);

  return null;
}
