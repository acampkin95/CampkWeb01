import { Faq } from "@/types/cms";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">FAQ</p>
        <h2 className="text-3xl font-semibold text-slate-900">Straight answers</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.id} className="group rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">
              {faq.question}
            </summary>
            <p className="mt-2 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
