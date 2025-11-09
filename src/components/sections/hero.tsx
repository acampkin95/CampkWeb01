import Image from "next/image";
import Link from "next/link";
import { HeroStat, SiteInfo, Theme } from "@/types/cms";

const DEFAULT_STATS: HeroStat[] = [
  { label: "Warehousing", value: "8 bays", detail: "63A power, CCTV, EV chargers" },
  { label: "Workshop", value: "Dealer-level", detail: "ADAS, diagnostics, MOT" },
  { label: "Retail", value: "FCA regulated", detail: "Finance, warranties, PX" },
];

export function Hero({ siteInfo, theme }: { siteInfo: SiteInfo; theme?: Theme }) {
  const overlay = theme?.heroOverlay ?? "rgba(15,23,42,0.65)";
  const stats = (siteInfo.heroStats?.length ? siteInfo.heroStats : DEFAULT_STATS).slice(0, 4);
  const heroImage = theme?.heroImage;
  const optimizedHeroSrc = heroImage
    ? `${heroImage}${heroImage.includes("?") ? "&" : "?"}auto=format&fit=crop&w=2000&q=75`
    : null;

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 text-white shadow-2xl">
      <div className="absolute inset-0 -z-10">
        {optimizedHeroSrc ? (
          <>
            <Image
              src={optimizedHeroSrc}
              alt="Campkin hero background"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: overlay }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.8))]" />
        )}
      </div>
      <div className="relative grid gap-10 p-8 lg:grid-cols-[1.4fr_1fr] lg:p-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-200">
            <span>{siteInfo.heroBadge ?? "Hertfordshire campus"}</span>
            <span className="text-white/40">•</span>
            <span>Phil Campkin</span>
          </div>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{siteInfo.heroTitle}</h1>
          <p className="text-lg text-white/80">{siteInfo.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#contact"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-200/40"
            >
              {siteInfo.ctaPrimary}
            </Link>
            <Link
              href="/cars"
              className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {siteInfo.ctaSecondary}
            </Link>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</dt>
                <dd className="text-2xl font-semibold">{stat.value}</dd>
                <p className="text-sm text-white/80">{stat.detail}</p>
              </div>
            ))}
          </dl>
        </div>
        <aside className="glass-panel space-y-4 rounded-3xl border border-white/20 bg-white/15 p-6 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Contact</p>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Visit us</p>
              <p className="text-base font-semibold text-slate-900">{siteInfo.address}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href={`tel:${siteInfo.phone}`} className="rounded-2xl bg-slate-900/90 px-4 py-2 text-white">
                {siteInfo.phone}
              </a>
              <a href={`mailto:${siteInfo.email}`} className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700">
                {siteInfo.email}
              </a>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hours</p>
            <p className="font-semibold text-slate-900">{siteInfo.hours}</p>
          </div>
          <div className="grid gap-2 text-xs text-slate-500">
            <p className="font-semibold text-slate-900">Full-service campus</p>
            <p>Warehouse lets • Workshop • Car sales • Compliance desk</p>
          </div>
        </aside>
      </div>
      <div className="pointer-events-none absolute -right-6 top-0 h-64 w-64 rounded-full bg-amber-400/30 blur-[140px]"></div>
      <div className="pointer-events-none absolute bottom-0 left-8 h-52 w-52 rounded-full bg-blue-400/20 blur-[120px]"></div>
    </section>
  );
}
