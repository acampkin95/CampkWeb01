import Link from "next/link";
import { SiteInfo } from "@/types/cms";

export function ContactCard({ siteInfo }: { siteInfo: SiteInfo }) {
  return (
    <section id="contact" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-500">Contact</p>
          <h2 className="text-3xl font-semibold text-slate-900">Book a bay or reserve a car</h2>
          <p className="text-slate-600">{siteInfo.address}</p>
        </div>
        <div className="space-y-2 text-lg font-semibold text-slate-900">
          <a href={`tel:${siteInfo.phone}`} className="block">{siteInfo.phone}</a>
          <a href={`mailto:${siteInfo.email}`} className="block text-blue-600">{siteInfo.email}</a>
          <p className="text-sm font-normal text-slate-500">{siteInfo.hours}</p>
        </div>
        <Link
          href="/admin"
          className="rounded-full bg-slate-900 px-6 py-3 text-white shadow-lg shadow-slate-900/20"
        >
          Open admin tools →
        </Link>
      </div>
    </section>
  );
}
