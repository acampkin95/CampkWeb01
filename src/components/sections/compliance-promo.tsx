import Link from "next/link";
import { PromoSection } from "@/types/cms";

export function CompliancePromo({ section }: { section: PromoSection }) {
  return (
    <section className="glass-panel grid gap-6 rounded-3xl border border-white/30 bg-white/60 p-8 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-500">{section.eyebrow}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{section.title}</h2>
        <p className="mt-2 text-slate-600">{section.description}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={section.primaryCta.href}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20"
          >
            {section.primaryCta.label}
          </Link>
          {section.secondaryCta && (
            <Link
              href={section.secondaryCta.href}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900"
            >
              {section.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">What&apos;s included?</p>
        <ul className="mt-3 space-y-2">
          {section.bullets.map((bullet) => (
            <li key={bullet}>• {bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
