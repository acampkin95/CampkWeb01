import { getCmsData } from "@/lib/dataStore";
import { WarehouseGrid } from "@/components/sections/warehouse-grid";
import { ContactCard } from "@/components/sections/contact-card";
import { WarehouseLeadForm } from "@/components/forms/warehouse-lead-form";

export const metadata = {
  title: "Warehouse space | Campkin",
  description: "8 flexible bays with security, EV charging, and on-site workshop support.",
};

export default async function WarehousePage() {
  const data = await getCmsData();
  const specs = [
    { label: "Total bays", value: "8 (63A power)" },
    { label: "Access", value: "24/7 ANPR + roller shutters" },
    { label: "Security", value: "Monitored CCTV & alarms" },
    { label: "Extras", value: "EV chargers, wash bay, fork lift" },
  ];

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-500">Warehouse</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">{data.warehouse.headline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{data.warehouse.subheading}</p>
        <dl className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2 md:grid-cols-4">
          {specs.map((spec) => (
            <div key={spec.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">{spec.label}</dt>
              <dd className="text-lg font-semibold text-slate-900">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <WarehouseGrid sections={data.warehouse.sections} />
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100">
        <h2 className="text-3xl font-semibold">Included services</h2>
        <ul className="mt-6 grid gap-6 text-lg md:grid-cols-2">
          <li>Shared boardroom and hot desk credits</li>
          <li>Inbound goods handling & forklift (08:00-17:00)</li>
          <li>On-site technicians for PDI, MOT prep and valeting</li>
          <li>Optional vehicle storage and retail handover support</li>
        </ul>
      </section>
      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 md:grid-cols-2">
        <ContactCard siteInfo={data.siteInfo} />
        <div className="rounded-3xl border border-dashed border-slate-200 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Book a bay</p>
          <h2 className="text-2xl font-semibold text-slate-900">Tell us your footprint</h2>
          <WarehouseLeadForm />
        </div>
      </section>
    </div>
  );
}
