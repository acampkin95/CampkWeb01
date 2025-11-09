"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  title: string;
};

export function VehicleGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const safeImages = images.length ? images : ["https://images.unsplash.com/photo-1503376780353-7e6692767b70"];
  const current = safeImages[Math.min(active, safeImages.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-slate-100">
        <Image src={current} alt={title} fill className="object-cover" priority />
      </div>
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {safeImages.map((img, index) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-32 overflow-hidden rounded-2xl border ${
                index === active ? "border-slate-900" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${title} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
