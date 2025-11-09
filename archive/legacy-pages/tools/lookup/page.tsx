import { VehicleLookupForm } from "@/components/forms/vehicle-lookup-form";

export const metadata = {
  title: "Vehicle compliance checks | Campkin",
  description: "Run DVLA + DVSA checks in seconds before taking a vehicle into stock.",
};

export default function VehicleLookupPage() {
  return (
    <div className="space-y-10 pb-16">
      <section className="glass-panel space-y-4 rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.6em] text-amber-300">Trade toolkit</p>
        <h1 className="text-4xl font-semibold">Instant DVLA + MOT checks</h1>
        <p className="text-lg text-white/80">
          Validate road tax, MOT history, and key DVLA data before acquiring or remarketing stock. Bring the GOV.UK data
          firehose into your Admin panel.
        </p>
        <p className="text-sm text-white/70">
          Need valuations? Hop over to the <span className="font-semibold">Buying qualification</span> desk for comps and offer ranges.
        </p>
      </section>
      <VehicleLookupForm />
    </div>
  );
}
