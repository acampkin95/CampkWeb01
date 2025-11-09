import Link from "next/link";
import { getCmsData } from "@/lib/dataStore";

export const metadata = {
  title: "Available cars | Campkin",
};

export default async function CarsPage() {
  const data = await getCmsData();
  const vehicles = data.vehicles;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Car sales & sourcing</p>
        <h1 className="text-3xl font-semibold text-slate-900">Certified stock</h1>
        <p className="text-sm text-slate-600">
          Every car is inspected upstairs, comes with buying documentation, and can be delivered nationwide within 24 hours.
        </p>
      </header>
      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <div className="flex flex-wrap items-center justify-between gap-3 text-slate-900">
              <h2 className="text-2xl font-semibold">{vehicle.title}</h2>
              <p className="text-xl font-semibold">£{vehicle.price.toLocaleString()}</p>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{vehicle.status}</p>
            <p className="mt-2 text-sm">
              {vehicle.year} · {vehicle.fuel} · {vehicle.transmission} · {vehicle.mileage.toLocaleString()} miles
            </p>
            <p className="mt-3 text-sm">{vehicle.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {vehicle.features.slice(0, 4).map((feature) => (
                <li key={feature} className="rounded-full border border-slate-200 px-3 py-1">
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          Looking for something not listed? Phil can source to spec and certify it in the upstairs bays before delivery.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/contact" className="rounded-full bg-slate-900 px-6 py-3 text-white">
            Request sourcing
          </Link>
          <Link href="/sublets" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900">
            View workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
