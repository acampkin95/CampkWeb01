"use client";

import { useEffect, useMemo, useState } from "react";
import { LeadRecord } from "@/types/leads";

export function LeadInbox() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/leads", { cache: "no-store" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Unable to fetch leads");
      }
      const payload = await response.json();
      setLeads(payload.leads ?? []);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const csvHref = useMemo(() => {
    if (!leads.length) return null;
    const header = ["Created", "Channel", "Name", "Email", "Phone", "Company", "Vehicle", "Message"];
    const rows = leads.map((lead) => [
      lead.createdAt,
      lead.channel,
      lead.name,
      lead.email,
      lead.phone ?? "",
      lead.company ?? "",
      lead.vehicleId ?? "",
      (lead.message ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.join(","))
      .join("\n");
    return URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  }, [leads]);

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Leads</p>
          <h2 className="text-2xl font-semibold text-slate-900">Inbound enquiries</h2>
          <p className="text-sm text-slate-500">Pulls from data/leads.json; refresh to pick up new submissions.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={fetchLeads}
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Refreshing…" : "Refresh"}
          </button>
          <a
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600"
            href={csvHref ?? "#"}
            download={"campkin-leads-" + new Date().toISOString().slice(0, 10) + ".csv"}
            aria-disabled={!csvHref}
          >
            Export CSV
          </a>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-400">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Channel</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  No enquiries captured yet.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-500">
                  {new Date(lead.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-2 font-semibold text-slate-900">{lead.channel}</td>
                <td className="px-3 py-2">{lead.name}</td>
                <td className="px-3 py-2 text-blue-600">{lead.email}</td>
                <td className="px-3 py-2">{lead.phone ?? "—"}</td>
                <td className="px-3 py-2">{lead.vehicleId ?? "—"}</td>
                <td className="px-3 py-2 text-slate-600">{lead.message ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}