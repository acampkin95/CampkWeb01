"use client";

import { useMemo, useState } from "react";
import { VehicleListing } from "@/types/cms";
import { VehicleLookupResult } from "@/types/vehicle";

type Props = {
  vehicle: VehicleListing;
  onUpdate: (payload: Partial<VehicleListing>) => void;
};

export function VehicleComplianceWidget({ vehicle, onUpdate }: Props) {
  const [preview, setPreview] = useState<VehicleLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [proofDraft, setProofDraft] = useState({ type: "", reference: "", url: "" });

  const runChecks = async () => {
    if (!vehicle.vrm) {
      setError("Add the registration number first.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vrm: vehicle.vrm,
          listPrice: vehicle.listPrice ?? vehicle.price,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Lookup failed");
      }
      setPreview(payload.result as VehicleLookupResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus("idle");
    }
  };

  const history = useMemo(() => [...(vehicle.complianceHistory ?? [])].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)), [
    vehicle.complianceHistory,
  ]);

  const addProof = () => {
    if (!proofDraft.type || !proofDraft.reference) return;
    const proofs = [...(vehicle.complianceProofs ?? []), {
      id: `proof-${vehicle.id}-${Date.now()}`,
      type: proofDraft.type,
      reference: proofDraft.reference,
      url: proofDraft.url || undefined,
      addedAt: new Date().toISOString(),
    }];
    onUpdate({ complianceProofs: proofs });
    setProofDraft({ type: "", reference: "", url: "" });
  };

  const removeProof = (id: string) => {
    const proofs = (vehicle.complianceProofs ?? []).filter((item) => item.id !== id);
    onUpdate({ complianceProofs: proofs });
  };

  const saveSnapshot = () => {
    if (!preview) return;
    const snapshot = {
      id: `snapshot-${vehicle.id}-${Date.now()}`,
      vrm: vehicle.vrm,
      recordedAt: new Date().toISOString(),
      summary: preview.dvla?.make ? `${preview.dvla.make} ${preview.dvla.model ?? ""}`.trim() : undefined,
      tax: preview.tax
        ? {
            regime: preview.tax.regime,
            firstYearRate: preview.tax.firstYearRate ?? null,
            totalAnnual: preview.tax.totalAnnual ?? null,
            expensiveCarSupplement: preview.tax.expensiveCarSupplement ?? null,
          }
        : undefined,
      ulez: preview.ulez?.status,
      caz: preview.caz?.status,
      notes: preview.tax?.notes?.[0],
    };
    const historyEntries = [...history, snapshot];
    onUpdate({ complianceHistory: historyEntries });
  };

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex-1 text-xs font-semibold text-slate-500">
          Registration (VRM)
          <input
            value={vehicle.vrm ?? ""}
            onChange={(event) => onUpdate({ vrm: event.target.value.toUpperCase() })}
            placeholder="e.g. LC21CMP"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm tracking-[0.4em]"
          />
        </label>
        <label className="flex-1 text-xs font-semibold text-slate-500">
          On-the-road / list price (£)
          <input
            type="number"
            value={vehicle.listPrice ?? ""}
            onChange={(event) => onUpdate({ listPrice: event.target.value ? Number(event.target.value) : undefined })}
            placeholder="Optional"
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={runChecks}
          className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Fetching..." : "Run GOV.UK checks"}
        </button>
      </div>
      <label className="block text-xs font-semibold text-slate-500">
        Compliance notes
        <textarea
          value={vehicle.complianceNotes ?? ""}
          onChange={(event) => onUpdate({ complianceNotes: event.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Record HPI refs, retrofit plans, or CAZ exemptions."
          rows={3}
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {preview && (
        <div className="space-y-3 text-xs text-slate-600">
          {preview.tax && (
            <p>
              <strong className="font-semibold text-slate-900">VED:</strong> {preview.tax.regime} · first-year{" "}
              {formatCurrency(preview.tax.firstYearRate)} / standard {formatCurrency(preview.tax.totalAnnual)}
            </p>
          )}
          {preview.ulez && (
            <p>
              <strong className="font-semibold text-slate-900">{preview.ulez.scheme}:</strong> {preview.ulez.status} –{" "}
              {preview.ulez.notes}
            </p>
          )}
          {preview.caz && (
            <p>
              <strong className="font-semibold text-slate-900">{preview.caz.scheme}:</strong> {preview.caz.status} –{" "}
              {preview.caz.notes}
            </p>
          )}
        </div>
      )}
      {preview && (
        <button
          type="button"
          onClick={saveSnapshot}
          className="text-xs font-semibold text-slate-700 underline"
        >
          Save snapshot to history
        </button>
      )}
      <section className="rounded-2xl border border-white/60 bg-white/80 p-4 text-xs text-slate-600">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Proof on file</p>
            <p className="text-sm text-slate-600">Attach finance clears, retrofit certs, or inspection docs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={proofDraft.type}
              onChange={(event) => setProofDraft((prev) => ({ ...prev, type: event.target.value }))}
              placeholder="Doc type"
              className="rounded-full border border-slate-200 px-3 py-1"
            />
            <input
              value={proofDraft.reference}
              onChange={(event) => setProofDraft((prev) => ({ ...prev, reference: event.target.value }))}
              placeholder="Reference"
              className="rounded-full border border-slate-200 px-3 py-1"
            />
            <input
              value={proofDraft.url}
              onChange={(event) => setProofDraft((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="Link (optional)"
              className="rounded-full border border-slate-200 px-3 py-1"
            />
            <button
              type="button"
              className="rounded-full bg-slate-900 px-3 py-1 text-white disabled:opacity-40"
              onClick={addProof}
              disabled={!proofDraft.type || !proofDraft.reference}
            >
              + Attach
            </button>
          </div>
        </header>
        <div className="mt-3 space-y-2">
          {(vehicle.complianceProofs ?? []).length === 0 && (
            <p className="text-slate-400">No documents stored for this vehicle yet.</p>
          )}
          {vehicle.complianceProofs?.map((proof) => (
            <div key={proof.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
              <div>
                <p className="font-semibold text-slate-900">{proof.type}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">{proof.reference}</p>
                <p className="text-[0.65rem] text-slate-400">Added {new Date(proof.addedAt).toLocaleDateString("en-GB")}</p>
              </div>
              <div className="flex items-center gap-2">
                {proof.url && (
                  <a href={proof.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600">
                    View
                  </a>
                )}
                <button type="button" onClick={() => removeProof(proof.id)} className="text-xs text-red-500">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Snapshot history</p>
        {history.length === 0 ? (
          <p className="mt-2 text-slate-400">No archived compliance events. Save one after your next lookup.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {history.slice(0, 4).map((entry) => (
              <li key={entry.id} className="rounded-xl border border-slate-100 px-3 py-2">
                <p className="font-semibold text-slate-900">
                  {new Date(entry.recordedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p>{entry.summary ?? entry.notes ?? "Compliance snapshot saved."}</p>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">
                  VED {entry.tax?.regime ?? "?"} · ULEZ {entry.ulez ?? "?"} · CAZ {entry.caz ?? "?"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return "—";
  return currency.format(value);
}
