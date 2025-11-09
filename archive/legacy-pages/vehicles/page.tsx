import { getCmsData } from "@/lib/dataStore";
import { VehicleBrowser } from "@/components/sections/vehicle-browser";
import { ContactCard } from "@/components/sections/contact-card";

export const metadata = {
  title: "Used car stock | Campkin",
  description: "Browse independent used car stock with finance and nationwide delivery.",
};

export default async function VehiclesPage() {
  const data = await getCmsData();

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-amber-500">Stocklist</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Independent, all-brand car sales</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Transparent pricing, no admin fees, FCA regulated finance and warranties, part-ex welcome, nationwide delivery, and vehicle sourcing for bespoke orders.
        </p>
      </section>
      <VehicleBrowser vehicles={data.vehicles} />
      <ContactCard siteInfo={data.siteInfo} />
    </div>
  );
}
