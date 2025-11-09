import { BuyingQualificationForm } from "@/components/forms/buying-qualification-form";

export const metadata = {
  title: "Buying qualification desk | Campkin",
  description: "Score incoming vehicles, estimate offers, and prep talk tracks before purchase or PX.",
};

export default function BuyingToolPage() {
  return (
    <div className="space-y-10 pb-16">
      <section className="glass-panel space-y-4 rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.6em] text-amber-300">Buying desk</p>
        <h1 className="text-4xl font-semibold">Rapid sanity-check</h1>
        <p className="text-lg text-white/80">
          Enter VRM + condition sliders to get a quick offer range, talk-track guidance, and a downloadable PDF you can
          drop into customer files or share on a call.
        </p>
      </section>
      <BuyingQualificationForm />
    </div>
  );
}
