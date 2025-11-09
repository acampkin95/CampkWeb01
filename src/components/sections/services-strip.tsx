import { ServiceItem } from "@/types/cms";

export function ServicesStrip({ services }: { services: ServiceItem[] }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">Aftersales</p>
        <h2 className="text-3xl font-semibold text-slate-900">Car repair & fleet support</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">{service.name}</h3>
              <span className="text-sm font-semibold text-slate-500">from £{service.priceFrom}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
