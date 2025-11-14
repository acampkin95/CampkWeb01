"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";

  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? "Invalid passcode");
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <Input
        type="password"
        label="Admin passcode"
        value={passcode}
        onChange={(event) => setPasscode(event.target.value)}
        placeholder="Enter passcode"
        error={error ?? undefined}
        required
        autoComplete="current-password"
        autoFocus
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={status === "submitting"}
      >
        {status === "submitting" ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
