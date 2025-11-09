import { getCmsData } from "@/lib/dataStore";
import { ServicesStrip } from "@/components/sections/services-strip";
import { ContactCard } from "@/components/sections/contact-card";

export const metadata = {
  title: "Workshop & Aftersales | Campkin",
  description: "Dealer-level diagnostics, MOT management and performance upgrades for any marque.",
};

const usp = [
  "FCA regulated finance & warranties",
  "Bosch, Autologic & Hunter equipment",
  "EV and hybrid trained master technicians",
  "Collection, delivery & mobile tyre van",
];

export default async function ServicesPage() {
  const data = await getCmsData();

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-500">Workshop</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">One stop aftersales</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Retail and fleet customers rely on our transparent menu pricing, digital health checks, and same-day approvals.
        </p>
        <ul className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          {usp.map((point) => (
            <li key={point} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-semibold">
              {point}
            </li>
          ))}
        </ul>
      </section>
      <ServicesStrip services={data.services} />
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100">
        <h2 className="text-2xl font-semibold">Retail add-ons</h2>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <article className="rounded-2xl bg-white/10 p-4">
            <h3 className="text-lg font-semibold">Warranty & GAP</h3>
            <p>12–36 month RAC warranties with national labour rate and roadside assistance.</p>
          </article>
          <article className="rounded-2xl bg-white/10 p-4">
            <h3 className="text-lg font-semibold">Finance</h3>
            <p>HP, PCP and lease purchase with e-sign, soft search and rate-for-risk.</p>
          </article>
          <article className="rounded-2xl bg-white/10 p-4">
            <h3 className="text-lg font-semibold">Logistics</h3>
            <p>Nationwide covered transport, airport meet-and-greet and foreign export paperwork.</p>
          </article>
        </div>
      </section>
      <ContactCard siteInfo={data.siteInfo} />
    </div>
  );
}
