"use client";

import { useState } from "react";

export function RevealPhone({ phone }: { phone: string }) {
  const [visible, setVisible] = useState(false);
  return visible ? (
    <a href={`tel:${phone}`} className="rounded-full bg-slate-900 px-6 py-3 text-white">
      {phone}
    </a>
  ) : (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="rounded-full border border-slate-300 px-6 py-3 text-slate-900"
    >
      Reveal number
    </button>
  );
}
