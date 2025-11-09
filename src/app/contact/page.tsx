import { ContactForm } from "@/components/forms/contact-form";
import { RevealPhone } from "@/components/contact/reveal-phone";
import { getCmsData } from "@/lib/dataStore";

export const metadata = {
  title: "Contact Phil | Campkin",
};

export default async function ContactPage() {
  const data = await getCmsData();
  const { siteInfo } = data;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 pb-12 md:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Contact</p>
        <h1 className="text-3xl font-semibold text-slate-900">Send a message</h1>
        <p className="text-sm text-slate-600">
          Phil answers every enquiry himself. Tell him if you need a bay, sourcing help, or a car audit and he’ll reply within one working day.
        </p>
        <ContactForm />
      </section>
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Direct line</p>
        <p className="text-sm text-slate-600">
          The number below only appears once you click it to deter spam bots.
        </p>
        <RevealPhone phone={siteInfo.phone} />
        <div className="space-y-2 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Warehouse</p>
            <p>{siteInfo.address}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hours</p>
            <p>{siteInfo.hours}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
            <a href={`mailto:${siteInfo.email}`} className="font-semibold text-slate-900">
              {siteInfo.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
