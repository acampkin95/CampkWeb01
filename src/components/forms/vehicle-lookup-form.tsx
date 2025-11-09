"use client";

import { useState } from "react";
import { AirQualityResult, VehicleLookupResult } from "@/types/vehicle";

type State = {
  result?: VehicleLookupResult;
  error?: string | null;
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function VehicleLookupForm() {
  const [vrm, setVrm] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [state, setState] = useState<State>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setState({});
    try {
      const response = await fetch("/api/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vrm,
          listPrice: listPrice ? Number(listPrice) : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Lookup failed");
      }
      setState({ result: payload.result });
    } catch (error) {
      setState({ error: (error as Error).message });
    } finally {
      setStatus("idle");
    }
  };

  const dvla = state.result?.dvla;
  const motTests = state.result?.motTests ?? [];
  const tax = state.result?.tax;
  const ulez = state.result?.ulez;
  const caz = state.result?.caz;

  return (
    <div className="space-y-6 glass-panel border border-white/40 bg-white/40 p-6 shadow-2xl shadow-slate-900/5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          UK registration
          <div className="mt-2 flex flex-col gap-3 lg:flex-row">
            <input
              value={vrm}
              onChange={(event) => setVrm(event.target.value.toUpperCase())}
              placeholder="e.g. AB12CDE"
              className="flex-1 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-lg font-semibold tracking-[0.3em] text-slate-900 focus:border-slate-900 focus:outline-none"
            />
            <div className="flex flex-1 items-end gap-3">
              <div className="flex-1">
                <label className="flex flex-col text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  On-the-road price (£)
                  <input
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={listPrice}
                    onChange={(event) => setListPrice(event.target.value.replace(/[^0-9.]/g, ""))}
                    placeholder="Optional"
                    className="mt-2 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-base font-semibold tracking-wide text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 disabled:opacity-50"
              >
                {status === "submitting" ? "Checking…" : "Run checks"}
              </button>
            </div>
          </div>
        </label>
      </form>
      {state.error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {dvla && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Vehicle profile</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {dvla.make} {dvla.model}
            </h3>
            <dl className="grid gap-2 text-sm text-slate-600">
              <Spec label="Colour" value={dvla.colour} />
              <Spec label="Fuel" value={dvla.fuelType} />
              <Spec label="CO₂" value={dvla.co2Emissions ? `${dvla.co2Emissions} g/km` : undefined} />
              <Spec label="Engine" value={dvla.engineCapacity ? `${dvla.engineCapacity} cc` : undefined} />
              <Spec label="Registered" value={formatDate(dvla.registrationDate)} />
            </dl>
          </section>
          <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Compliance</p>
            <dl className="grid gap-3 text-sm text-slate-800">
              <Spec label="Road tax" value={dvla.taxStatus} emphasis />
              <Spec label="Tax due" value={formatDate(dvla.taxDueDate)} />
              <Spec label="MOT status" value={dvla.motStatus} emphasis />
              <Spec label="MOT expires" value={formatDate(dvla.motExpiryDate)} />
            </dl>
            <a
              href="https://vehicleenquiry.service.gov.uk/"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-amber-700 underline"
            >
              Double-check on GOV.UK
            </a>
          </section>
        </div>
      )}
      {tax && (
        <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Road tax forecast</p>
            {tax.bandLabel && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-700">
                {tax.bandLabel}
              </span>
            )}
            <span className="rounded-full border border-emerald-100 bg-white/60 px-3 py-1 text-xs font-semibold text-emerald-700">
              {describeRegime(tax.regime)}
            </span>
          </div>
          <dl className="grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
            <Spec label="First-year rate" value={formatCurrency(tax.firstYearRate)} emphasis />
            <Spec label="Standard rate" value={formatCurrency(tax.annualRate)} />
            <Spec label="Expensive car supplement" value={formatCurrency(tax.expensiveCarSupplement)} />
            <Spec label="Year-two payable" value={formatCurrency(tax.totalAnnual)} emphasis />
          </dl>
          {tax.notes.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-600">
              {tax.notes.map((note, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {(ulez || caz) && (
        <section className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Air quality zones</p>
            <span className="text-xs text-slate-500">Heuristics based on DVLA Euro status</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ulez && <ComplianceCard data={ulez} />}
            {caz && <ComplianceCard data={caz} />}
          </div>
        </section>
      )}
      {motTests.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">MOT history</p>
              <h3 className="text-xl font-semibold text-slate-900">{motTests.length} recorded tests</h3>
            </div>
          </div>
          <div className="space-y-3">
            {motTests.map((test, index) => (
              <article key={`${test.completedDate}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  {formatDate(test.completedDate)} · {test.testResult?.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  Odometer: {test.odometerValue} {test.odometerUnit} ({test.odometerResultType})
                </p>
                {test.expiryDate && <p className="text-xs text-slate-500">Expiry: {formatDate(test.expiryDate)}</p>}
                {test.rfrAndComments && test.rfrAndComments.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {test.rfrAndComments.slice(0, 4).map((item, idx) => (
                      <li key={idx} className={item.dangerous ? "text-red-600" : undefined}>
                        {item.type === "ADVISORY" ? "Advisory: " : ""} {item.text}
                      </li>
                    ))}
                    {test.rfrAndComments.length > 4 && <li className="text-slate-400">+ more</li>}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({ label, value, emphasis }: { label: string; value?: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={emphasis ? "font-semibold text-slate-900" : "text-slate-600"}>{value ?? "—"}</span>
    </div>
  );
}

function formatDate(input?: string) {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.valueOf())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "—";
  return currency.format(value);
}

function describeRegime(regime: "modern" | "legacy" | "pre_2001" | "unknown") {
  switch (regime) {
    case "modern":
      return "2017+ tariff";
    case "legacy":
      return "2001-2017 tariff";
    case "pre_2001":
      return "Pre-2001 engine tariff";
    default:
      return "Guidance";
  }
}

function ComplianceCard({ data }: { data: AirQualityResult }) {
  const tone =
    data.status === "Compliant"
      ? "text-emerald-600 border-emerald-200 bg-white"
      : data.status === "Chargeable"
        ? "text-amber-600 border-amber-200 bg-white"
        : "text-slate-600 border-slate-200 bg-white";

  return (
    <article className={`space-y-2 rounded-2xl border ${tone} p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{data.scheme}</p>
        <span className="text-sm font-semibold">{data.status}</span>
      </div>
      <p className="text-sm text-slate-600">{data.notes}</p>
      {data.referenceUrl && (
        <a href={data.referenceUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600">
          Verify → 
        </a>
      )}
    </article>
  );
}
