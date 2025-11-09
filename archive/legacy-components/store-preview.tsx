import Image from "next/image";
import Link from "next/link";
import { StorefrontSection, VehicleListing } from "@/types/cms";

export function StorePreview({ vehicles, storefront }: { vehicles: VehicleListing[]; storefront: StorefrontSection }) {
  const highlight = vehicles.slice(0, 3);
  const info = storefront.highlights ?? [];
  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-500">{storefront.eyebrow}</p>
          <h2 className="text-3xl font-semibold text-slate-900">{storefront.title}</h2>
          <p className="text-slate-600">{storefront.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={storefront.primaryCta.href} className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white">
              {storefront.primaryCta.label}
            </Link>
            {storefront.secondaryCta && (
              <Link
                href={storefront.secondaryCta.href}
                className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-900"
              >
                {storefront.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
        <dl className="grid gap-3 text-sm text-slate-600 lg:max-w-sm lg:text-right">
          {info.map((item) => (
            <div key={`${item.eyebrow}-${item.title}`}>
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.eyebrow}</dt>
              <dd className="font-semibold text-slate-900">{item.title}</dd>
              <p>{item.description}</p>
            </div>
          ))}
          {info.length === 0 && (
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Compliance-first</dt>
              <dd className="font-semibold text-slate-900">Proof-ready listings</dd>
              <p>DVLA tax, MOT, ULEZ/CAZ decisions & proof packs surfaced on every listing.</p>
            </div>
          )}
        </dl>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {highlight.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={vehicle.images[0] ?? "https://images.unsplash.com/photo-1503376780353-7e6692767b70"}
                alt={vehicle.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{vehicle.status}</p>
              <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
              <p>
                {vehicle.year} · {vehicle.fuel} · {vehicle.transmission}
              </p>
              <p className="text-2xl font-bold text-slate-900">£{vehicle.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
