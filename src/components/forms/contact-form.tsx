"use client";

import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
  botField: "",
};

export function ContactForm() {
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formState.botField) {
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "general",
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
        }),
      });
      if (!response.ok) {
        throw new Error("Unable to send message – please retry.");
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
      <input
        type="text"
        name="botField"
        value={formState.botField}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
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
        Phone (optional)
        <input
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Message
        <textarea
          name="message"
          value={formState.message}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      {status === "success" && <p className="text-sm text-emerald-600">Thanks – Phil will reply shortly.</p>}
      {status === "error" && error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="cta-primary w-full rounded-full py-3 text-sm font-semibold disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
