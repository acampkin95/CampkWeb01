import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCmsData } from "@/lib/dataStore";
import { ChevronLeft, Phone, Mail, CheckCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCmsData();
  const vehicle = data.vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found",
    };
  }

  return {
    title: `${vehicle.title} - £${vehicle.price.toLocaleString()}`,
    description: vehicle.description,
    openGraph: {
      images: vehicle.images?.[0] ? [vehicle.images[0]] : [],
    },
  };
}

export async function generateStaticParams() {
  const data = await getCmsData();
  return data.vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getCmsData();
  const vehicle = data.vehicles.find((v) => v.id === id);

  if (!vehicle) {
    notFound();
  }

  const { siteInfo } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-8 sm:space-y-8 sm:pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 overflow-x-auto pb-2 sm:pb-0">
        <Link href="/" className="hover:text-[var(--chelsea-blue)] transition-colors whitespace-nowrap">
          Home
        </Link>
        <span className="flex-shrink-0">/</span>
        <Link href="/cars" className="hover:text-[var(--chelsea-blue)] transition-colors whitespace-nowrap">
          Cars
        </Link>
        <span className="flex-shrink-0">/</span>
        <span className="text-slate-900 truncate">{vehicle.title}</span>
      </nav>

      {/* Back Button */}
      <Link
        href="/cars"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--chelsea-blue)] hover:text-[var(--orange-cta)] transition-colors"
      >
        <ChevronLeft className="h-4 w-4 flex-shrink-0" />
        Back to all cars
      </Link>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--chelsea-blue)] sm:text-3xl lg:text-4xl break-words">{vehicle.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-slate-600">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  vehicle.status === "In Stock"
                    ? "bg-green-100 text-green-800"
                    : vehicle.status === "Reserved"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {vehicle.status}
              </span>
              {vehicle.vrm && (
                <span className="font-mono text-xs font-semibold uppercase tracking-wider border border-slate-300 rounded px-2 py-1">
                  {vehicle.vrm}
                </span>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-2xl font-bold text-[var(--chelsea-blue)] sm:text-3xl lg:text-4xl">
              £{vehicle.price.toLocaleString()}
            </p>
            {vehicle.listPrice && vehicle.listPrice > vehicle.price && (
              <p className="text-sm text-slate-500 line-through">£{vehicle.listPrice.toLocaleString()}</p>
            )}
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="space-y-4">
        {vehicle.images && vehicle.images.length > 0 ? (
          <>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={vehicle.images[0]}
                alt={`${vehicle.title} - main image`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              />
            </div>
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {vehicle.images.slice(1).map((img, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={img}
                      alt={`${vehicle.title} - image ${idx + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            No images available
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:space-y-8 lg:col-span-2">
          {/* Key Specifications */}
          <section className="glass-panel p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--chelsea-blue)]">Key Specifications</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Year</p>
                <p className="font-semibold text-slate-900">{vehicle.year}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Mileage</p>
                <p className="font-semibold text-slate-900">{vehicle.mileage.toLocaleString()} miles</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Fuel Type</p>
                <p className="font-semibold text-slate-900">{vehicle.fuel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">Transmission</p>
                <p className="font-semibold text-slate-900">{vehicle.transmission}</p>
              </div>
              {vehicle.body && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Body Type</p>
                  <p className="font-semibold text-slate-900">{vehicle.body}</p>
                </div>
              )}
              {vehicle.colour && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Colour</p>
                  <p className="font-semibold text-slate-900">{vehicle.colour}</p>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="glass-panel p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--chelsea-blue)]">Description</h2>
            <p className="text-sm leading-relaxed text-slate-700">{vehicle.description}</p>
          </section>

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <section className="glass-panel p-4 sm:p-6 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--chelsea-blue)]">Features & Equipment</h2>
              <ul className="grid gap-2 text-sm md:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Compliance Information */}
          {vehicle.complianceNotes && (
            <section className="glass-panel p-4 sm:p-6 space-y-4 bg-blue-50 border-blue-200">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--chelsea-blue)]">Compliance & Tax Information</h2>
              <p className="text-sm leading-relaxed text-slate-700">{vehicle.complianceNotes}</p>
            </section>
          )}
        </div>

        {/* Sidebar - Contact CTA */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-4 sm:p-6 space-y-4 sm:space-y-6 lg:sticky lg:top-20">
            <h3 className="text-base sm:text-lg font-bold text-[var(--chelsea-blue)]">Interested in this vehicle?</h3>
            <div className="space-y-3">
              <Link
                href={`/contact?vehicle=${encodeURIComponent(vehicle.title)}`}
                className="cta-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-center font-semibold"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Send Enquiry</span>
              </Link>
              {siteInfo?.phone && (
                <a
                  href={`tel:${siteInfo.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--chelsea-blue)] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base text-center font-semibold text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="break-all">{siteInfo.phone}</span>
                </a>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
              <h4 className="font-semibold text-slate-900">What&apos;s included:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                  <span>Full inspection documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                  <span>12-month warranty</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                  <span>HPI clear certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                  <span>Nationwide delivery available</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
              <p>
                Price shown is the final on-the-road price. No hidden fees. Finance options available on request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="glass-panel p-6 sm:p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-[var(--chelsea-blue)]">Need something different?</h3>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Phil can source vehicles to your exact specifications and certify them in our upstairs bays before delivery.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Link href="/contact" className="cta-primary rounded-full px-6 py-3 sm:px-8 text-sm sm:text-base font-semibold">
            Request Sourcing
          </Link>
          <Link
            href="/cars"
            className="rounded-full border-2 border-[var(--chelsea-blue)] px-6 py-3 sm:px-8 text-sm sm:text-base font-semibold text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all"
          >
            View All Stock
          </Link>
        </div>
      </section>
    </div>
  );
}
