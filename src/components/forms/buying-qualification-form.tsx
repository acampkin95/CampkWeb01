"use client";

import { useState } from "react";
import type { BuyingRequest, BuyingResult } from "@/types/buying";

const damageKeys = [
  { key: "bodywork", label: "Bodywork" },
  { key: "interior", label: "Interior" },
  { key: "mechanical", label: "Mechanical" },
] as const;

export function BuyingQualificationForm() {
  const [form, setForm] = useState({
    vrm: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    askingPrice: "",
    notes: "",
  });
  const [damage, setDamage] = useState<Record<string, number>>({
    bodywork: 1,
    interior: 1,
    mechanical: 1,
  });
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [pdfStatus, setPdfStatus] = useState<"idle" | "generating">("idle");
  const [result, setResult] = useState<BuyingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<BuyingRequest | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setResult(null);
    try {
      const submission: BuyingRequest = {
        vrm: form.vrm || undefined,
        make: form.make || undefined,
        model: form.model || undefined,
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        askingPrice: form.askingPrice ? Number(form.askingPrice) : undefined,
        damage,
        notes: form.notes || undefined,
      };
      setLastPayload(submission);
      const response = await fetch("/api/buying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody?.message ?? "Buying tool failed");
      }
      setResult(responseBody.result as BuyingResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus("idle");
    }
  };

  const downloadPdf = async () => {
    if (!lastPayload) return;
    setPdfStatus("generating");
    setError(null);
    try {
      const response = await fetch("/api/buying/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastPayload),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "PDF generation failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `buying-${lastPayload.vrm ?? lastPayload.make ?? "report"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPdfStatus("idle");
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            VRM (optional)
            <input
              value={form.vrm}
              onChange={(event) => setForm((prev) => ({ ...prev, vrm: event.target.value.toUpperCase() }))}
              placeholder="AB12CDE"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm tracking-[0.3em]"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Asking price (£)
            <input
              type="number"
              value={form.askingPrice}
              onChange={(event) => setForm((prev) => ({ ...prev, askingPrice: event.target.value }))}
              placeholder="25000"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Make
            <input
              value={form.make}
              onChange={(event) => setForm((prev) => ({ ...prev, make: event.target.value }))}
              placeholder="BMW"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Model
            <input
              value={form.model}
              onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
              placeholder="330e"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Year
            <input
              type="number"
              value={form.year}
              onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
              placeholder="2021"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Mileage
            <input
              type="number"
              value={form.mileage}
              onChange={(event) => setForm((prev) => ({ ...prev, mileage: event.target.value }))}
              placeholder="31000"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {damageKeys.map(({ key, label }) => (
            <label key={key} className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {label} damage (1 = clean, 5 = heavy)
              <input
                type="range"
                min={1}
                max={5}
                value={damage[key]}
                onChange={(event) => setDamage((prev) => ({ ...prev, [key]: Number(event.target.value) }))}
                className="mt-2 w-full"
              />
              <span className="text-sm text-slate-700">{damage[key]}</span>
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Client notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="e.g. wants fast payout, panel scrape on OSR."
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "submitting" ? "Running quick sanity check..." : "Run buying sanity check"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={result.status} />
            <p className="text-sm text-slate-500">Damage index {result.damageAverage.toFixed(1)} / 5</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Recommended offer</p>
            <p className="text-3xl font-semibold text-slate-900">
              £{result.offerRange.min.toLocaleString()} – £{result.offerRange.max.toLocaleString()}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-600">Based on current live comps + damage penalty.</p>
              <button
                type="button"
                onClick={downloadPdf}
                disabled={pdfStatus === "generating" || !lastPayload}
                className="rounded-full border border-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-40"
              >
                {pdfStatus === "generating" ? "Preparing PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-700">{result.talkingPoint}</p>
          {result.vehicleProfile && (
            <div className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 md:grid-cols-3">
              <Spec label="Make" value={result.vehicleProfile.make} />
              <Spec label="Model" value={result.vehicleProfile.model} />
              <Spec label="Fuel" value={result.vehicleProfile.fuelType} />
              <Spec label="Colour" value={result.vehicleProfile.colour} />
              <Spec label="Registered" value={formatDate(result.vehicleProfile.registrationDate)} />
            </div>
          )}
          {result.comparables.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live comparables</p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {result.comparables.slice(0, 4).map((comp, index) => (
                  <article key={`${comp.source}-${index}`} className="rounded-2xl border border-slate-100 p-3 text-sm">
                    <p className="font-semibold text-slate-900">{comp.title}</p>
                    <p className="text-xs text-slate-400">{comp.source}{comp.location ? ` · ${comp.location}` : ""}</p>
                    <p className="text-lg font-semibold text-slate-900">£{comp.price.toLocaleString()}</p>
                    {comp.mileage && <p className="text-xs text-slate-500">{comp.mileage.toLocaleString()} miles</p>}
                    {comp.url && (
                      <a href={comp.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600">
                        View listing →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === "Green"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette}`}>{status} status</span>;
}
