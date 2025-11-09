import Image from "next/image";
import Link from "next/link";
import { VehicleListing } from "@/types/cms";

export function VehicleShowcase({ vehicles }: { vehicles: VehicleListing[] }) {
  const featured = vehicles.slice(0, 3);
  return (
    <section className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-300">Forecourt</p>
          <h2 className="text-3xl font-semibold">Latest arrivals</h2>
          <p className="text-sm text-white/70">Every listing comes with compliance proofs and a downloadable buying report.</p>
        </div>
        <Link
          href="/vehicles"
          className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          View all stock →
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {featured.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}`}
            className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image
                src={vehicle.images[0] ?? "https://images.unsplash.com/photo-1503376780353-7e6692767b70"}
                alt={vehicle.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                {vehicle.status}
              </span>
            </div>
            <div className="mt-4 flex flex-1 flex-col gap-2 text-sm text-white/80">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                <span>{vehicle.year}</span>
                <span>{vehicle.body}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{vehicle.title}</h3>
              <p>
                {vehicle.mileage.toLocaleString()} miles · {vehicle.fuel}
              </p>
              <p className="text-2xl font-bold text-white">£{vehicle.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
