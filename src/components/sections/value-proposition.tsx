import { BuildingOffice2Icon, WrenchScrewdriverIcon, ShoppingBagIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { ValuePropConfig } from "@/types/cms";

const iconMap: Record<string, typeof BuildingOffice2Icon> = {
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
};

export function ValueProposition({ block }: { block: ValuePropConfig }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">{block.eyebrow}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{block.title}</h2>
        <p className="text-slate-600">{block.description}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {block.items.map(({ icon, title, description, id }) => {
          const IconComponent = iconMap[icon] ?? SparklesIcon;
          return (
            <article key={id} className="rounded-2xl border border-white/60 bg-white/80 px-5 py-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-slate-900/90 p-3 text-white">
                  <IconComponent className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
