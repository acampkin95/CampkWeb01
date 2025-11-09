import { PerformanceMetrics } from "@/types/cms";

export function PerformanceStrip({ performance }: { performance?: PerformanceMetrics }) {
  if (!performance) return null;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Performance</p>
          <h2 className="text-3xl font-semibold text-slate-900">Live operational metrics</h2>
          <p className="mt-2 text-sm text-slate-600">Numbers refresh whenever you publish new admin updates.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          {performance.badges.map((badge) => (
            <span key={badge} className="rounded-full border border-slate-200 px-3 py-1">
              {badge}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-6 grid gap-4 md:grid-cols-4">
        {performance.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</dt>
            <dd className="text-3xl font-semibold text-slate-900">{stat.value}</dd>
            <p className="text-sm text-slate-500">{stat.description}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}
