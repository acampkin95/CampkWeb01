import Link from "next/link";
import { getCmsData } from "@/lib/dataStore";
import { CarsFilter } from "@/components/cars/cars-filter";

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
        <h1 className="text-3xl font-semibold text-[var(--chelsea-blue)]">Certified stock</h1>
        <p className="text-sm text-slate-600">
          Every car is inspected upstairs, comes with buying documentation, and can be delivered nationwide within 24 hours.
        </p>
      </header>

      <CarsFilter vehicles={vehicles} />

      <div className="glass-panel p-8 text-center">
        <h3 className="text-xl font-bold text-[var(--chelsea-blue)] mb-3">Looking for something not listed?</h3>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Phil can source to spec and certify it in the upstairs bays before delivery.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/contact" className="cta-primary rounded-full px-8 py-3">
            Request sourcing
          </Link>
          <Link href="/sublets" className="rounded-full border-2 border-[var(--chelsea-blue)] px-8 py-3 text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all">
            View workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
