import { WarehouseSection } from "@/types/cms";

export function WarehouseGrid({ sections }: { sections: WarehouseSection[] }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Warehouse units</p>
        <h2 className="text-3xl font-semibold text-slate-900">Availability & spec</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.id}
            className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{section.name}</h3>
                <p className="text-sm text-slate-500">{section.sizeSqFt} sq ft · £{section.pricePerMonth.toLocaleString()} pcm</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(section.availability)}`}
              >
                {section.availability}
              </span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              {section.features.map((feature) => (
                <li key={feature} className="rounded-full bg-slate-100 px-3 py-1">
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function statusColor(status: WarehouseSection["availability"]) {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-700";
    case "Reserved":
      return "bg-amber-100 text-amber-700";
    case "Let":
      return "bg-slate-200 text-slate-600";
    case "In Prep":
      return "bg-blue-100 text-blue-700";
    case "Coming Soon":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-slate-200 text-slate-600";
  }
}
