"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
      setTimeout(() => setStatus("idle"), 5000);
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
        aria-hidden="true"
      />

      <Input
        label="Name"
        name="name"
        value={formState.name}
        onChange={handleChange}
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formState.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />

      <Input
        label="Phone (optional)"
        type="tel"
        name="phone"
        value={formState.phone}
        onChange={handleChange}
        autoComplete="tel"
      />

      <Textarea
        label="Message"
        name="message"
        value={formState.message}
        onChange={handleChange}
        required
        rows={4}
      />

      {status === "success" && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 animate-scale-in" role="alert">
          <p className="text-sm font-medium text-emerald-900">
            ✓ Thanks – Phil will reply shortly.
          </p>
        </div>
      )}

      {status === "error" && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 animate-scale-in" role="alert">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
