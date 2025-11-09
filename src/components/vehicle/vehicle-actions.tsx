"use client";

import { useState } from "react";
import { VehicleListing } from "@/types/cms";

export function VehicleActions({ vehicle }: { vehicle: VehicleListing }) {
  const [status, setStatus] = useState<"idle" | "shared" | "downloaded">("idle");

  const shareVehicle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle.title,
          text: `${vehicle.title} – £${vehicle.price.toLocaleString()}`,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
        setStatus("shared");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (error) {
        console.error("Share cancelled", error);
      }
    }
  };

  const downloadSpec = () => {
    const spec = `Vehicle: ${vehicle.title}\nPrice: £${vehicle.price.toLocaleString()}\nMileage: ${vehicle.mileage.toLocaleString()} miles\nFuel: ${vehicle.fuel}\nTransmission: ${vehicle.transmission}\nBody: ${vehicle.body}\nColour: ${vehicle.colour}\nStatus: ${vehicle.status}\nFeatures: ${vehicle.features.join(", " )}`;
    const blob = new Blob([spec], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${vehicle.id}-spec.txt`;
    link.click();
    setStatus("downloaded");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <button
        type="button"
        onClick={shareVehicle}
        className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700"
      >
        Share listing
      </button>
      <button
        type="button"
        onClick={downloadSpec}
        className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700"
      >
        Download spec
      </button>
      {status === "shared" && <span className="text-emerald-600">Shared!</span>}
      {status === "downloaded" && <span className="text-emerald-600">Spec saved.</span>}
    </div>
  );
}
