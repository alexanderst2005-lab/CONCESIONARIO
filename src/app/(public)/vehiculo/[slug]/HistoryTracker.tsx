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
        brandName: vehicle.marca,
        modelName: vehicle.modelo,
        year: vehicle.ano,
        city: vehicle.ubicacion,
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
