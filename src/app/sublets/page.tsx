import Link from "next/link";
import { getCmsData } from "@/lib/dataStore";

export const metadata = {
  title: "Sublet listings | Campkin",
};

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function SubletsPage() {
  const data = await getCmsData();
  const sections = data.warehouse.sections;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Sublet manager</p>
        <h1 className="text-3xl font-semibold text-slate-900">Six bays, one owner</h1>
        <p className="text-sm text-slate-600">
          Flexible monthly licences with forklift support, two parking spaces per bay, CCTV, and 24/7 access.
        </p>
      </header>
      <div className="grid gap-4">
        {sections.map((section) => (
          <article key={section.id} className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{section.availability}</p>
                <h2 className="text-2xl font-semibold text-slate-900">{section.name}</h2>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                £{section.pricePerMonth.toLocaleString()} / month · {section.sizeSqFt} sq ft
              </p>
            </div>
            <ul className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              {section.features.map((feature) => (
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
          Need to combine bays or add storage rooms? Phil can tailor each licence to your fleet or e-commerce setup.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/contact" className="rounded-full bg-slate-900 px-6 py-3 text-white">
            Contact Phil
          </Link>
          <Link href="/contact" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900">
            Request callback
          </Link>
        </div>
      </div>
    </div>
  );
}
