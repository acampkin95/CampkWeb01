import Link from "next/link";
import { getCmsData } from "@/lib/dataStore";
import { Hero } from "@/components/sections/hero";

export default async function Home() {
  const data = await getCmsData();
  const bays = data.warehouse.sections;
  const featuredBays = bays.slice(0, 3);
  const cars = data.vehicles.slice(0, 3);

  return (
    <div className="space-y-10 pb-12">
      <Hero siteInfo={data.siteInfo} theme={data.theme} />

      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Meet Phil</p>
          <h2 className="text-3xl font-semibold text-slate-900">One-person workshop + warehouse</h2>
          <p className="text-sm text-slate-600">
            Campkin is a single converted unit: two medium bays, two large bays, and six upstairs storage rooms. Every
            licence includes forklift help, two parking spaces, CCTV, and fibre internet.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sublet manager</p>
            <p className="font-semibold text-slate-900">Month-to-month with Phil handling access, forklift, and admin.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Buying & certification</p>
            <p className="font-semibold text-slate-900">Each car is audited upstairs before it goes on sale or sourcing list.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sublet listings</p>
          <h3 className="text-2xl font-semibold text-[var(--chelsea-blue)]">See what&apos;s open</h3>
          <p className="text-sm text-slate-600">Medium + large bays, each with two parking spots and shared amenities.</p>
          <Link href="/sublets" className="mt-4 inline-flex items-center rounded-full bg-[var(--chelsea-blue)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--orange-cta)] transition-colors">
            Browse bays
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Available cars</p>
          <h3 className="text-2xl font-semibold text-[var(--chelsea-blue)]">Sales + sourcing</h3>
          <p className="text-sm text-slate-600">Small, curated stock with buying certification and friendly delivery.</p>
          <Link href="/cars" className="mt-4 inline-flex items-center rounded-full bg-[var(--chelsea-blue)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--orange-cta)] transition-colors">
            View cars
          </Link>
        </article>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Currently available</p>
            <h2 className="text-2xl font-semibold text-[var(--chelsea-blue)]">Warehouse snapshot</h2>
          </div>
          <Link href="/sublets" className="rounded-full border-2 border-[var(--chelsea-blue)] px-5 py-2 text-sm font-semibold text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all">
            View all bays
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredBays.map((bay) => (
            <article key={bay.id} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{bay.availability}</p>
              <h3 className="text-lg font-semibold text-slate-900">{bay.name}</h3>
              <p>{bay.sizeSqFt} sq ft · £{bay.pricePerMonth.toLocaleString()} / month</p>
              <ul className="mt-3 space-y-1 text-xs">
                {bay.features.slice(0, 3).map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cars</p>
            <h2 className="text-2xl font-semibold text-[var(--chelsea-blue)]">Ready to show</h2>
          </div>
          <Link href="/cars" className="rounded-full border-2 border-[var(--chelsea-blue)] px-5 py-2 text-sm font-semibold text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all">
            View all cars
          </Link>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {cars.map((vehicle) => (
            <Link key={vehicle.id} href={`/cars/${vehicle.id}`}>
              <article className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600 hover:border-[var(--chelsea-blue)] hover:shadow-md transition-all h-full">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{vehicle.status}</p>
                <h3 className="text-lg font-semibold text-[var(--chelsea-blue)]">{vehicle.title}</h3>
                <p>{vehicle.year} · {vehicle.fuel}</p>
                <p className="text-xl font-semibold text-[var(--chelsea-blue)] mt-2">£{vehicle.price.toLocaleString()}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-panel p-8 text-center space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Vehicle Lookup Tool</p>
          <h2 className="text-2xl font-semibold text-[var(--chelsea-blue)] mt-2">Check any UK car instantly</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Free VRM lookup for MOT history, tax status, and DVLA compliance. Perfect for buyers or sellers.
          </p>
        </div>
        <Link href="/admin#buying-tools" className="cta-primary inline-flex rounded-full px-8 py-3 text-sm font-semibold">
          Try Vehicle Lookup
        </Link>
      </section>

      <section className="glass-panel p-8 text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Let&apos;s talk</p>
        <h2 className="text-3xl font-semibold text-[var(--chelsea-blue)]">Need a bay or a certified car?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
          Phil answers every enquiry himself. Share what you need and he&apos;ll respond within one working day.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
          <Link href="/contact" className="cta-primary rounded-full px-8 py-3">
            Contact Phil
          </Link>
          <Link href="/sublets" className="rounded-full border-2 border-[var(--chelsea-blue)] px-8 py-3 text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all">
            View sublets
          </Link>
        </div>
      </section>
    </div>
  );
}
