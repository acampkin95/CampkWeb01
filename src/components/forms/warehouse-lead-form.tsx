'use client';

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
};

export function WarehouseLeadForm() {
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "warehouse", ...formState }),
      });
      if (!response.ok) {
        throw new Error("Unable to send enquiry – please retry.");
      }
      setStatus("success");
      setFormState(initialState);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Name
          <input
            name="name"
            value={formState.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Company
          <input
            name="company"
            value={formState.company}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Email
          <input
            type="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Phone
          <input
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Tell us what you need
        <textarea
          name="message"
          value={formState.message}
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          rows={4}
        />
      </label>
      {status === "success" && (
        <p className="text-sm text-emerald-600">Thanks – the lettings team will be in touch shortly.</p>
      )}
      {status === "error" && error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
