import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsData } from "@/lib/dataStore";
import { VehicleLeadForm } from "@/components/forms/vehicle-lead-form";
import { VehicleGallery } from "@/components/vehicle/vehicle-gallery";
import { VehicleActions } from "@/components/vehicle/vehicle-actions";
import { fetchVehicleLookup } from "@/lib/services/vehicle";
import type { VehicleListing } from "@/types/cms";
import type { AirQualityResult, RoadTaxEstimate } from "@/types/vehicle";

export async function generateStaticParams() {
  const data = await getCmsData();
  return data.vehicles.map((vehicle) => ({ id: vehicle.id }));
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const data = await getCmsData();
  const vehicle = data.vehicles.find((item) => item.id === params.id);
  if (!vehicle) {
    notFound();
  }
  let lookup: Awaited<ReturnType<typeof fetchVehicleLookup>> | null = null;
  if (vehicle.vrm) {
    try {
      lookup = await fetchVehicleLookup(vehicle.vrm, { listPrice: vehicle.listPrice });
    } catch (error) {
      console.error("Vehicle compliance lookup failed", error);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <Link href="/vehicles" className="text-sm font-semibold text-slate-500">
        ← Back to stocklist
      </Link>
      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <VehicleGallery images={vehicle.images} title={vehicle.title} />
          <VehicleActions vehicle={vehicle} />
          <div className="grid gap-4 md:grid-cols-2">
            <Spec label="Price" value={`£${vehicle.price.toLocaleString()}`} />
            <Spec label="Mileage" value={`${vehicle.mileage.toLocaleString()} miles`} />
            <Spec label="Fuel" value={vehicle.fuel} />
            <Spec label="Transmission" value={vehicle.transmission} />
            <Spec label="Body" value={vehicle.body} />
            <Spec label="Colour" value={vehicle.colour} />
          </div>
          <section>
            <h2 className="text-xl font-semibold text-slate-900">Vehicle overview</h2>
            <p className="mt-2 text-slate-600">{vehicle.description}</p>
            <ul className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              {vehicle.features.map((feature) => (
                <li key={feature} className="rounded-full bg-slate-100 px-3 py-1">
                  {feature}
                </li>
              ))}
            </ul>
          </section>
          <VehicleComplianceSummary
            tax={lookup?.tax}
            ulez={lookup?.ulez}
            caz={lookup?.caz}
            notes={vehicle.complianceNotes}
            proofs={vehicle.complianceProofs}
            history={vehicle.complianceHistory}
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Reserve {vehicle.title}</h2>
            <p className="text-sm text-slate-500">Secure it with a refundable £200 holding deposit.</p>
            <VehicleLeadForm vehicleId={vehicle.id} vehicleTitle={vehicle.title} />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Need finance?</h3>
            <p className="text-sm text-slate-600">FCA regulated partners can arrange HP, PCP, and business contract hire same-day.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function VehicleComplianceSummary({
  tax,
  ulez,
  caz,
  notes,
  proofs,
  history,
}: {
  tax?: RoadTaxEstimate | null;
  ulez?: AirQualityResult;
  caz?: AirQualityResult;
  notes?: string;
  proofs?: VehicleListing["complianceProofs"];
  history?: VehicleListing["complianceHistory"];
}) {
  if (!tax && !ulez && !caz && !notes) {
    return null;
  }
  return (
    <section className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Compliance summary</p>
      {tax && (
        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">VED (road tax)</p>
            <p className="text-lg font-semibold text-slate-900">{describeRegime(tax.regime)}</p>
            <p>
              First-year: {formatCurrency(tax.firstYearRate)} · Standard: {formatCurrency(tax.totalAnnual)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expensive car supplement</p>
            <p className="text-lg font-semibold text-slate-900">
              {tax.expensiveCarSupplement ? formatCurrency(tax.expensiveCarSupplement) : "Not applicable"}
            </p>
          </div>
        </div>
      )}
      {(ulez || caz) && (
        <div className="grid gap-4 md:grid-cols-2">
          {ulez && <CompliancePill data={ulez} />}
          {caz && <CompliancePill data={caz} />}
        </div>
      )}
      {notes && (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 p-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Campkin notes</p>
          <p className="mt-1">{notes}</p>
        </div>
      )}
      {proofs && proofs.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Proof on file</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {proofs.map((proof) => (
              <a
                key={proof.id}
                href={proof.url ?? "#"}
                target={proof.url ? "_blank" : undefined}
                rel={proof.url ? "noreferrer" : undefined}
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
              >
                {proof.type} · {new Date(proof.addedAt).toLocaleDateString("en-GB")}
              </a>
            ))}
          </div>
        </div>
      )}
      {history && history.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Audit trail</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {[...history]
              .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
              .slice(0, 3)
              .map((entry) => (
                <li key={entry.id} className="rounded-xl border border-slate-100 px-3 py-2">
                  <p className="font-semibold text-slate-900">
                    {new Date(entry.recordedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    VED {entry.tax?.regime ?? "?"} · ULEZ {entry.ulez ?? "?"} · CAZ {entry.caz ?? "?"}
                  </p>
                  {entry.notes && <p>{entry.notes}</p>}
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function CompliancePill({ data }: { data: AirQualityResult }) {
  const tone =
    data.status === "Compliant"
      ? "bg-white text-emerald-700 border-emerald-200"
      : data.status === "Chargeable"
        ? "bg-white text-amber-700 border-amber-200"
        : "bg-white text-slate-700 border-slate-200";
  return (
    <div className={`rounded-2xl border ${tone} p-4`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        <span>{data.scheme}</span>
        <span className="text-base font-semibold text-slate-900">{data.status}</span>
      </div>
      <p className="mt-2 text-sm">{data.notes}</p>
    </div>
  );
}

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "—";
  return currency.format(value);
}

function describeRegime(regime: RoadTaxEstimate["regime"]) {
  switch (regime) {
    case "modern":
      return "Post-April 2017 tariff";
    case "legacy":
      return "2001-2017 CO₂ tariff";
    case "pre_2001":
      return "Pre-2001 engine tariff";
    default:
      return "Guidance";
  }
}
