import { Testimonial } from "@/types/cms";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Proof</p>
          <h2 className="text-3xl font-semibold">Trusted by fleets and drivers</h2>
        </div>
        <p className="max-w-sm text-sm text-slate-300">
          Flexible storage, honest retailing, and FCA compliant finance built for small businesses and retail buyers alike.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.id} className="rounded-2xl bg-white/10 p-6">
            <p className="text-lg font-medium">“{testimonial.quote}”</p>
            <footer className="mt-4 text-sm text-amber-200">{testimonial.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
