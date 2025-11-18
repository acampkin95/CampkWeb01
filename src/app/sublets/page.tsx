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
        <h1 className="text-3xl font-semibold text-[var(--chelsea-blue)]">Six bays, one owner</h1>
        <p className="text-sm text-slate-600">
          Flexible monthly licences with forklift support, two parking spaces per bay, CCTV, and 24/7 access.
        </p>
      </header>
      <div className="grid gap-4">
        {sections.map((section) => (
          <article key={section.id} className="glass-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{section.availability}</p>
                <h2 className="text-2xl font-semibold text-[var(--chelsea-blue)]">{section.name}</h2>
              </div>
              <p className="text-lg font-semibold text-[var(--chelsea-blue)]">
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
      <div className="glass-panel p-8 text-center">
        <h3 className="text-xl font-bold text-[var(--chelsea-blue)] mb-3">Need a custom setup?</h3>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Need to combine bays or add storage rooms? Phil can tailor each licence to your fleet or e-commerce setup.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/contact" className="cta-primary rounded-full px-8 py-3">
            Contact Phil
          </Link>
          <Link href="/contact" className="rounded-full border-2 border-[var(--chelsea-blue)] px-8 py-3 text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all">
            Request callback
          </Link>
        </div>
      </div>
    </div>
  );
}
