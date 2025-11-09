import { SiteInfo } from "@/types/cms";

export function MapPanel({ siteInfo }: { siteInfo: SiteInfo }) {
  if (!siteInfo.mapUrl) return null;
  return (
    <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Visit</p>
        <h2 className="text-3xl font-semibold text-slate-900">Showroom & depot</h2>
        <p className="text-slate-600">{siteInfo.address}</p>
        <div className="text-sm text-slate-500">
          <p>Phone: <a href={`tel:${siteInfo.phone}`} className="font-semibold text-slate-900">{siteInfo.phone}</a></p>
          <p>Email: <a href={`mailto:${siteInfo.email}`} className="font-semibold text-slate-900">{siteInfo.email}</a></p>
          <p>Hours: {siteInfo.hours}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <iframe
          src={siteInfo.mapUrl}
          className="h-72 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Campkin map"
        />
      </div>
    </section>
  );
}
