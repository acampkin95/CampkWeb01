"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CmsData, HeroStat, ServiceItem, VehicleListing, WarehouseSection } from "@/types/cms";
import { LeadInbox } from "@/components/admin/lead-inbox";
import { VehicleComplianceWidget } from "@/components/admin/vehicle-compliance-widget";
import { MediaLibrary } from "@/components/admin/media-library";

type PerformanceStat = NonNullable<CmsData["performance"]>["stats"][number];

const availabilityOptions: WarehouseSection["availability"][] = [
  "Available",
  "Reserved",
  "Let",
  "In Prep",
  "Coming Soon",
];

const statusOptions: VehicleListing["status"][] = ["In Stock", "Reserved", "In Prep", "Sold"];

type HeroEditableField = Exclude<keyof CmsData["siteInfo"], "heroStats">;

const siteInfoFields: Array<{ key: HeroEditableField; label: string; multiline?: boolean }> = [
  { key: "heroTitle", label: "Hero title" },
  { key: "heroSubtitle", label: "Hero subtitle", multiline: true },
  { key: "heroBadge", label: "Hero badge" },
  { key: "tagline", label: "Site tagline" },
  { key: "ctaPrimary", label: "Primary call-to-action" },
  { key: "ctaSecondary", label: "Secondary CTA" },
  { key: "address", label: "Address", multiline: true },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "hours", label: "Opening hours" },
  { key: "mapUrl", label: "Google Maps embed URL", multiline: true },
];

const themeFields: Array<{ key: keyof CmsData["theme"]; label: string; type?: "color" | "text" }>
  = [
    { key: "brandColor", label: "Brand color", type: "color" },
    { key: "accentColor", label: "Accent color", type: "color" },
    { key: "mutedColor", label: "Muted color", type: "color" },
    { key: "backgroundColor", label: "Background color", type: "color" },
    { key: "heroOverlay", label: "Hero overlay (rgba)" },
    { key: "heroImage", label: "Hero background image" },
    { key: "logoText", label: "Logotype text" },
  ];

const navTabs = [
  { key: "hub", label: "Hub" },
  { key: "content", label: "Website" },
  { key: "vehicles", label: "Car sales" },
  { key: "proofs", label: "Certification" },
  { key: "warehouse", label: "Sublets" },
  { key: "services", label: "Services" },
] as const;

type NavKey = (typeof navTabs)[number]["key"];

const hubModules = [
  {
    key: "content" as const,
    title: "Website customiser",
    description: "Edit hero copy, colours, homepage cards, and contact details.",
  },
  {
    key: "vehicles" as const,
    title: "Car sales",
    description: "Add or retire cars, update pricing, and refresh certification notes.",
  },
  {
    key: "proofs" as const,
    title: "Sell / buy certification",
    description: "Manage compliance notes, proofs, and badges shown on listings.",
  },
  {
    key: "warehouse" as const,
    title: "Sublet manager",
    description: "Update bay availability, pricing, and storage notes.",
  },
  {
    key: "services" as const,
    title: "Service offerings",
    description: "Tune the small list of services and testimonials.",
  },
];

export function AdminDashboard({ initialData }: { initialData: CmsData }) {
  const [nav, setNav] = useState<NavKey>("hub");
  const router = useRouter();
  const [formData, setFormData] = useState<CmsData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<CmsData>(initialData);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [jsonCopied, setJsonCopied] = useState(false);
  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(lastSaved), [formData, lastSaved]);

  const updateSiteInfo = (key: keyof CmsData["siteInfo"], value: string) => {
    setFormData((prev) => ({ ...prev, siteInfo: { ...prev.siteInfo, [key]: value } }));
  };

  const updateSection = (index: number, payload: Partial<WarehouseSection>) => {
    setFormData((prev) => {
      const sections = [...prev.warehouse.sections];
      sections[index] = { ...sections[index], ...payload };
      return { ...prev, warehouse: { ...prev.warehouse, sections } };
    });
  };

  const updateService = (index: number, payload: Partial<ServiceItem>) => {
    setFormData((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], ...payload } as ServiceItem;
      return { ...prev, services };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { id: `service-${Date.now()}`, name: "New service", description: "", priceFrom: 0 },
      ],
    }));
  };

  const updateVehicle = (index: number, payload: Partial<VehicleListing>) => {
    setFormData((prev) => {
      const vehicles = [...prev.vehicles];
      vehicles[index] = { ...vehicles[index], ...payload } as VehicleListing;
      return { ...prev, vehicles };
    });
  };

  const removeVehicle = (id: string) => {
    setFormData((prev) => ({ ...prev, vehicles: prev.vehicles.filter((vehicle) => vehicle.id !== id) }));
  };

  const addVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      vehicles: [
        {
          id: `stk${Date.now()}`,
          title: "New vehicle",
          price: 0,
          mileage: 0,
          fuel: "Petrol",
          transmission: "Manual",
          year: new Date().getFullYear(),
          images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70"],
          description: "",
          status: "In Stock",
          body: "Hatchback",
          colour: "",
          features: [],
        },
        ...prev.vehicles,
      ],
    }));
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setMessage("Unable to copy JSON");
      setMessageType("error");
    }
  };

  const updateTheme = (key: keyof CmsData["theme"], value: string) => {
    setFormData((prev) => ({ ...prev, theme: { ...prev.theme, [key]: value } }));
  };

  const updateTestimonial = (index: number, payload: Partial<CmsData["testimonials"][number]>) => {
    setFormData((prev) => {
      const testimonials = [...prev.testimonials];
      testimonials[index] = { ...testimonials[index], ...payload };
      return { ...prev, testimonials };
    });
  };

  const addTestimonial = () => {
    setFormData((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: `testimonial-${Date.now()}`, name: "New client", quote: "New quote" },
      ],
    }));
  };

  const removeTestimonial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((testimonial) => testimonial.id !== id),
    }));
  };

  const updateFaq = (index: number, payload: Partial<CmsData["faqs"][number]>) => {
    setFormData((prev) => {
      const faqs = [...prev.faqs];
      faqs[index] = { ...faqs[index], ...payload };
      return { ...prev, faqs };
    });
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { id: `faq-${Date.now()}`, question: "New question", answer: "Answer" }],
    }));
  };

  const removeFaq = (id: string) => {
    setFormData((prev) => ({ ...prev, faqs: prev.faqs.filter((faq) => faq.id !== id) }));
  };

  const updatePerformanceStat = (index: number, payload: Partial<PerformanceStat>) => {
    setFormData((prev) => {
      const performance = prev.performance ?? { stats: [], badges: [] };
      const stats = [...performance.stats];
      stats[index] = { ...stats[index], ...payload };
      return { ...prev, performance: { ...performance, stats } };
    });
  };

  const addPerformanceStat = () => {
    setFormData((prev) => {
      const performance = prev.performance ?? { stats: [], badges: [] };
      return {
        ...prev,
        performance: {
          ...performance,
          stats: [
            ...performance.stats,
            { label: "New stat", value: "0", description: "Description" },
          ],
        },
      };
    });
  };

  const removePerformanceStat = (index: number) => {
    setFormData((prev) => {
      const performance = prev.performance ?? { stats: [], badges: [] };
      const stats = performance.stats.filter((_, idx) => idx !== index);
      return { ...prev, performance: { ...performance, stats } };
    });
  };

  const updatePerformanceBadges = (value: string) => {
    setFormData((prev) => {
      const performance = prev.performance ?? { stats: [], badges: [] };
      const badges = value
        .split(",")
        .map((badge) => badge.trim())
        .filter(Boolean);
      return { ...prev, performance: { ...performance, badges } };
    });
  };

  const updateHeroStat = (index: number, payload: Partial<HeroStat>) => {
    setFormData((prev) => {
      const stats = [...(prev.siteInfo.heroStats ?? [])];
      stats[index] = { ...stats[index], ...payload };
      return { ...prev, siteInfo: { ...prev.siteInfo, heroStats: stats } };
    });
  };

  const addHeroStat = () => {
    setFormData((prev) => {
      const stats = [...(prev.siteInfo.heroStats ?? [])];
      stats.push({ label: "New stat", value: "0", detail: "Detail" });
      return { ...prev, siteInfo: { ...prev.siteInfo, heroStats: stats } };
    });
  };

  const removeHeroStat = (index: number) => {
    setFormData((prev) => {
      const stats = (prev.siteInfo.heroStats ?? []).filter((_, idx) => idx !== index);
      return { ...prev, siteInfo: { ...prev.siteInfo, heroStats: stats } };
    });
  };

  const updateStorefrontField = (key: keyof CmsData["storefront"], value: string) => {
    setFormData((prev) => ({ ...prev, storefront: { ...prev.storefront, [key]: value } }));
  };

  const updateStorefrontCta = (target: "primaryCta" | "secondaryCta", field: "label" | "href", value: string) => {
    setFormData((prev) => ({
      ...prev,
      storefront: {
        ...prev.storefront,
        [target]: {
          ...(prev.storefront?.[target] ?? { label: "", href: "" }),
          [field]: value,
        },
      },
    }));
  };

  const updateStorefrontHighlight = (
    index: number,
    payload: Partial<CmsData["storefront"]["highlights"][number]>,
  ) => {
    setFormData((prev) => {
      const highlights = [...prev.storefront.highlights];
      highlights[index] = { ...highlights[index], ...payload };
      return { ...prev, storefront: { ...prev.storefront, highlights } };
    });
  };

  const addStorefrontHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      storefront: {
        ...prev.storefront,
        highlights: [
          ...prev.storefront.highlights,
          { eyebrow: "New highlight", title: "", description: "" },
        ],
      },
    }));
  };

  const removeStorefrontHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      storefront: {
        ...prev.storefront,
        highlights: prev.storefront.highlights.filter((_, idx) => idx !== index),
      },
    }));
  };

  const updateValuePropsField = (key: "eyebrow" | "title" | "description", value: string) => {
    setFormData((prev) => ({ ...prev, valueProps: { ...prev.valueProps, [key]: value } }));
  };

  const updateValuePropItem = (
    index: number,
    payload: Partial<CmsData["valueProps"]["items"][number]>,
  ) => {
    setFormData((prev) => {
      const items = [...prev.valueProps.items];
      items[index] = { ...items[index], ...payload };
      return { ...prev, valueProps: { ...prev.valueProps, items } };
    });
  };

  const addValuePropItem = () => {
    setFormData((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: [
          ...prev.valueProps.items,
          { id: `value-prop-${Date.now()}`, title: "New block", description: "", icon: "SparklesIcon" },
        ],
      },
    }));
  };

  const removeValuePropItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      valueProps: {
        ...prev.valueProps,
        items: prev.valueProps.items.filter((item) => item.id !== id),
      },
    }));
  };

  const updatePromoField = (key: keyof CmsData["compliancePromo"], value: string) => {
    if (key === "bullets") return;
    setFormData((prev) => ({ ...prev, compliancePromo: { ...prev.compliancePromo, [key]: value } }));
  };

  const updatePromoBullets = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      compliancePromo: {
        ...prev.compliancePromo,
        bullets: value.split(/\r?\n/).map((bullet) => bullet.trim()).filter(Boolean),
      },
    }));
  };

  const updatePromoCta = (target: "primaryCta" | "secondaryCta", field: "label" | "href", value: string) => {
    setFormData((prev) => ({
      ...prev,
      compliancePromo: {
        ...prev.compliancePromo,
        [target]: {
          ...(prev.compliancePromo?.[target] ?? { label: "", href: "" }),
          [field]: value,
        },
      },
    }));
  };

  const updateContactField = (key: keyof CmsData["contactCta"], value: string) => {
    setFormData((prev) => ({ ...prev, contactCta: { ...prev.contactCta, [key]: value } }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    setMessageType(null);
    try {
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Failed to save data");
      }
      const saved = payload as CmsData;
      setFormData(saved);
      setLastSaved(saved);
      setMessageType("success");
      setMessage("Changes published successfully");
    } catch (error) {
      setMessageType("error");
      setMessage((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const heroStats = formData.siteInfo.heroStats ?? [];
  const performance = formData.performance ?? { stats: [], badges: [] };
  const storefront = formData.storefront;
  const valuePropsBlock = formData.valueProps;
  const promo = formData.compliancePromo;
  const contactCta = formData.contactCta;

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 border border-white/30 px-6 py-4 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900">Campkin control room</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setNav(tab.key)}
              className={`rounded-full px-4 py-2 transition ${
                nav === tab.key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-semibold ${isDirty ? "text-amber-600" : "text-emerald-600"}`}>
            {isDirty ? "Drafts pending" : "All changes live"}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Publish"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Logout
          </button>
        </div>
      </div>
      {nav === "hub" && (
        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-8 md:grid-cols-2">
          {hubModules.map((module) => (
            <article key={module.key} className="rounded-2xl border border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{module.title}</p>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <button
                type="button"
                onClick={() => setNav(module.key)}
                className="mt-4 text-sm font-semibold text-slate-900"
              >
                Open →
              </button>
            </article>
          ))}
        </section>
      )}

      {nav !== "hub" && (
        <>
          {nav === "content" && (
            <>
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Site copy</p>
            <h2 className="text-2xl font-semibold text-slate-900">Hero & contact details</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={copyJson}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600"
            >
              {jsonCopied ? "Copied" : "Copy JSON"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Publish"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Logout
            </button>
          </div>
        </header>
        {message && (
          <p
            className={`mt-2 text-sm ${messageType === "error" ? "text-red-600" : "text-slate-500"}`}
          >
            {message}
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {siteInfoFields.map(({ key, label, multiline }) => (
            <label key={key} className="text-sm font-medium text-slate-600">
              {label}
              {multiline ? (
                <textarea
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  value={formData.siteInfo[key] ?? ""}
                  onChange={(event) => updateSiteInfo(key, event.target.value)}
                />
              ) : (
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  value={formData.siteInfo[key] ?? ""}
                  onChange={(event) => updateSiteInfo(key, event.target.value)}
                />
              )}
            </label>
          ))}
        </div>
          </section>

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Storefront</p>
          <h2 className="text-2xl font-semibold text-slate-900">Homepage sales narrative</h2>
          <p className="text-sm text-slate-500">Edit the hero copy that introduces the vehicle grid.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {(["eyebrow", "title"] as const).map((field) => (
            <label key={field} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {field}
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                value={storefront[field]}
                onChange={(event) => updateStorefrontField(field, event.target.value)}
              />
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Description
          <textarea
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={storefront.description}
            onChange={(event) => updateStorefrontField("description", event.target.value)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {(["primaryCta", "secondaryCta"] as const).map((slot) => (
            <div key={slot} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{slot}</p>
              <label className="mt-2 block text-xs font-semibold text-slate-500">
                Label
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={storefront[slot]?.label ?? ""}
                  onChange={(event) => updateStorefrontCta(slot, "label", event.target.value)}
                />
              </label>
              <label className="mt-2 block text-xs font-semibold text-slate-500">
                URL
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={storefront[slot]?.href ?? ""}
                  onChange={(event) => updateStorefrontCta(slot, "href", event.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Highlights</p>
            <button type="button" onClick={addStorefrontHighlight} className="text-xs font-semibold text-blue-600">
              + Add highlight
            </button>
          </div>
          {storefront.highlights.map((highlight, index) => (
            <article key={`${highlight.eyebrow}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Card {index + 1}</span>
                <button type="button" onClick={() => removeStorefrontHighlight(index)} className="text-red-500">
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs font-semibold text-slate-500">
                  Eyebrow
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={highlight.eyebrow}
                    onChange={(event) => updateStorefrontHighlight(index, { eyebrow: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Title
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={highlight.title}
                    onChange={(event) => updateStorefrontHighlight(index, { title: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Description
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={highlight.description}
                    onChange={(event) => updateStorefrontHighlight(index, { description: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Value proposition</p>
          <h2 className="text-2xl font-semibold text-slate-900">Three-pillar messaging</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {(["eyebrow", "title", "description"] as const).map((field) => (
            <label key={field} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {field}
              {field === "description" ? (
                <textarea
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  value={valuePropsBlock[field]}
                  onChange={(event) => updateValuePropsField(field, event.target.value)}
                />
              ) : (
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={valuePropsBlock[field]}
                  onChange={(event) => updateValuePropsField(field, event.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cards</p>
            <button type="button" onClick={addValuePropItem} className="text-xs font-semibold text-blue-600">
              + Add card
            </button>
          </div>
          {valuePropsBlock.items.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Card {index + 1}</span>
                <button type="button" onClick={() => removeValuePropItem(item.id)} className="text-red-500">
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <label className="text-xs font-semibold text-slate-500">
                  Title
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={item.title}
                    onChange={(event) => updateValuePropItem(index, { title: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500 md:col-span-2">
                  Description
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={item.description}
                    onChange={(event) => updateValuePropItem(index, { description: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Icon (Heroicons export)
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={item.icon}
                    onChange={(event) => updateValuePropItem(index, { icon: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compliance promo</p>
          <h2 className="text-2xl font-semibold text-slate-900">DVLA / MOT intelligence block</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {(["eyebrow", "title"] as const).map((field) => (
            <label key={field} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {field}
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                value={promo[field] as string}
                onChange={(event) => updatePromoField(field, event.target.value)}
              />
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Description
          <textarea
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={promo.description}
            onChange={(event) => updatePromoField("description", event.target.value)}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Bullets (one per line)
          <textarea
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            value={promo.bullets.join("\n")}
            onChange={(event) => updatePromoBullets(event.target.value)}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {(["primaryCta", "secondaryCta"] as const).map((slot) => (
            <div key={slot} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{slot}</p>
              <label className="mt-2 block text-xs font-semibold text-slate-500">
                Label
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={promo[slot]?.label ?? ""}
                  onChange={(event) => updatePromoCta(slot, "label", event.target.value)}
                />
              </label>
              <label className="mt-2 block text-xs font-semibold text-slate-500">
                URL
                <input
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  value={promo[slot]?.href ?? ""}
                  onChange={(event) => updatePromoCta(slot, "href", event.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact CTA</p>
          <h2 className="text-2xl font-semibold text-slate-900">Form intro copy</h2>
        </header>
        {(["eyebrow", "title", "description", "formCopy"] as const).map((field) => (
          <label key={field} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {field}
            {field === "description" || field === "formCopy" ? (
              <textarea
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                value={contactCta[field]}
                onChange={(event) => updateContactField(field, event.target.value)}
              />
            ) : (
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                value={contactCta[field]}
                onChange={(event) => updateContactField(field, event.target.value)}
              />
            )}
          </label>
        ))}
      </section>

            </>
          )}

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hero metrics</p>
            <h2 className="text-2xl font-semibold text-slate-900">Stats under the masthead</h2>
          </div>
          <button type="button" onClick={addHeroStat} className="text-sm font-semibold text-blue-600">
            + Add stat
          </button>
        </header>
        <div className="space-y-4">
          {heroStats.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No stats yet. Add up to three quick facts to sit beneath the hero copy.
            </p>
          )}
          {heroStats.map((stat, index) => (
            <article key={`${stat.label}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Stat #{index + 1}</p>
                <button type="button" onClick={() => removeHeroStat(index)} className="text-xs font-semibold text-red-500">
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs font-semibold text-slate-500">
                  Label
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={stat.label}
                    onChange={(event) => updateHeroStat(index, { label: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Value
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={stat.value}
                    onChange={(event) => updateHeroStat(index, { value: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Detail
                  <input
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    value={stat.detail}
                    onChange={(event) => updateHeroStat(index, { detail: event.target.value })}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <MediaLibrary />

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Branding</p>
          <h2 className="text-2xl font-semibold text-slate-900">Appearance & theme</h2>
          <p className="text-sm text-slate-500">Color tokens feed straight into CSS variables and the hero background.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {themeFields.map(({ key, label, type }) => (
            <label key={key} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {label}
              <input
                type={type ?? "text"}
                value={formData.theme[key]}
                onChange={(event) => updateTheme(key, event.target.value)}
                className={`${
                  type === "color" ? "h-12 cursor-pointer" : ""
                } mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm`}
              />
            </label>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["brandColor", "accentColor", "mutedColor"].map((key) => (
            <div key={key} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold text-slate-500">{key}</p>
              <div
                className="mt-3 h-16 rounded-xl shadow-inner"
                style={{ backgroundColor: formData.theme[key as keyof CmsData["theme"]] }}
              />
            </div>
          ))}
        </div>
      </section>

          {nav === "warehouse" && (
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Warehouse</p>
          <h2 className="text-2xl font-semibold text-slate-900">Unit availability</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {formData.warehouse.sections.map((section, index) => (
            <article key={section.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{section.name}</h3>
                <select
                  value={section.availability}
                  onChange={(event) =>
                    updateSection(index, { availability: event.target.value as WarehouseSection["availability"] })
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                >
                  {availabilityOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <label className="mt-3 block text-xs font-semibold text-slate-500">
                Monthly price (£)
                <input
                  type="number"
                  value={section.pricePerMonth}
                  onChange={(event) => updateSection(index, { pricePerMonth: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-slate-500">
                Features (comma separated)
                <input
                  value={section.features.join(", ")}
                  onChange={(event) =>
                    updateSection(index, {
                      features: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </article>
          ))}
        </div>
            </section>
          )}

          {nav === "services" && (
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Aftersales</p>
            <h2 className="text-2xl font-semibold text-slate-900">Service menu</h2>
          </div>
          <button onClick={addService} className="text-sm font-semibold text-blue-600">
            + Add service line
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {formData.services.map((service, index) => (
            <article key={service.id} className="rounded-2xl border border-slate-100 p-4">
              <label className="text-xs font-semibold text-slate-500">
                Title
                <input
                  value={service.name}
                  onChange={(event) => updateService(index, { name: event.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-slate-500">
                Description
                <textarea
                  value={service.description}
                  onChange={(event) => updateService(index, { description: event.target.value })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-3 block text-xs font-semibold text-slate-500">
                Price from (£)
                <input
                  type="number"
                  value={service.priceFrom}
                  onChange={(event) => updateService(index, { priceFrom: Number(event.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </article>
          ))}
        </div>
            </section>
          )}

          {nav === "content" && (
            <>
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Social proof</p>
            <h2 className="text-2xl font-semibold text-slate-900">Testimonials</h2>
          </div>
          <button onClick={addTestimonial} className="text-sm font-semibold text-blue-600">
            + Add testimonial
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {formData.testimonials.map((testimonial, index) => (
            <article key={testimonial.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <input
                  value={testimonial.name}
                  onChange={(event) => updateTestimonial(index, { name: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="ml-3 text-xs font-semibold text-red-500"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={testimonial.quote}
                onChange={(event) => updateTestimonial(index, { quote: event.target.value })}
                className="mt-3 h-24 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FAQ</p>
            <h2 className="text-2xl font-semibold text-slate-900">Questions & answers</h2>
          </div>
          <button onClick={addFaq} className="text-sm font-semibold text-blue-600">
            + Add FAQ
          </button>
        </header>
        <div className="space-y-4">
          {formData.faqs.map((faq, index) => (
            <article key={faq.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <input
                  value={faq.question}
                  onChange={(event) => updateFaq(index, { question: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  className="ml-3 text-xs font-semibold text-red-500"
                >
                  Remove
                </button>
              </div>
              <textarea
                value={faq.answer}
                onChange={(event) => updateFaq(index, { answer: event.target.value })}
                className="mt-3 h-20 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Operations</p>
            <h2 className="text-2xl font-semibold text-slate-900">Performance metrics</h2>
          </div>
          <button onClick={addPerformanceStat} className="text-sm font-semibold text-blue-600">
            + Add stat
          </button>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {performance.stats.map((stat, index) => (
            <article key={`${stat.label}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <input
                  value={stat.label}
                  onChange={(event) => updatePerformanceStat(index, { label: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => removePerformanceStat(index)}
                  className="ml-3 text-xs font-semibold text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-500">
                  Value
                  <input
                    value={stat.value}
                    onChange={(event) => updatePerformanceStat(index, { value: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Description
                  <input
                    value={stat.description}
                    onChange={(event) => updatePerformanceStat(index, { description: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </article>
          ))}
          {performance.stats.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Add your first metric to power the homepage performance strip.
            </p>
          )}
        </div>
        <label className="block text-xs font-semibold text-slate-500">
          Badges (comma separated)
          <input
            value={performance.badges.join(", ")}
            onChange={(event) => updatePerformanceBadges(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </section>
            </>
          )}

          {nav === "vehicles" && (
            <>
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicle stock</p>
            <h2 className="text-2xl font-semibold text-slate-900">Autotrader-style listings</h2>
          </div>
          <button onClick={addVehicle} className="text-sm font-semibold text-blue-600">
            + Add vehicle
          </button>
        </header>
        <div className="space-y-4">
          {formData.vehicles.map((vehicle, index) => (
            <article key={vehicle.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="text-xs font-semibold text-red-500"
                  type="button"
                >
                  Remove
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="text-xs font-semibold text-slate-500">
                  Title
                  <input
                    value={vehicle.title}
                    onChange={(event) => updateVehicle(index, { title: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Price (£)
                  <input
                    type="number"
                    value={vehicle.price}
                    onChange={(event) => updateVehicle(index, { price: Number(event.target.value) })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Mileage
                  <input
                    type="number"
                    value={vehicle.mileage}
                    onChange={(event) => updateVehicle(index, { mileage: Number(event.target.value) })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Fuel
                  <input
                    value={vehicle.fuel}
                    onChange={(event) => updateVehicle(index, { fuel: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Transmission
                  <input
                    value={vehicle.transmission}
                    onChange={(event) => updateVehicle(index, { transmission: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Year
                  <input
                    type="number"
                    value={vehicle.year}
                    onChange={(event) => updateVehicle(index, { year: Number(event.target.value) })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Body style
                  <input
                    value={vehicle.body}
                    onChange={(event) => updateVehicle(index, { body: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Colour
                  <input
                    value={vehicle.colour}
                    onChange={(event) => updateVehicle(index, { colour: event.target.value })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-500">
                  Status
                  <select
                    value={vehicle.status}
                    onChange={(event) => updateVehicle(index, { status: event.target.value as VehicleListing["status"] })}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-4 block text-xs font-semibold text-slate-500">
                Image URL
                <input
                  value={vehicle.images[0] ?? ""}
                  onChange={(event) => updateVehicle(index, { images: [event.target.value] })}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-4 block text-xs font-semibold text-slate-500">
                Features (comma separated)
                <input
                  value={vehicle.features.join(", ")}
                  onChange={(event) =>
                    updateVehicle(index, {
                      features: event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </article>
          ))}
        </div>
      </section>

      <LeadInbox />
            </>
          )}

          {nav === "content" && (
      <section className="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Data tools</p>
            <h2 className="text-2xl font-semibold text-slate-900">JSON snapshot</h2>
          </div>
          <div className="flex items-center gap-3">
            {jsonCopied && <span className="text-xs text-emerald-600">Copied!</span>}
            <button
              type="button"
              onClick={copyJson}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Copy JSON
            </button>
          </div>
        </header>
        <p className="text-sm text-slate-500">
          Handy when seeding staging environments or handing content off to colleagues.
        </p>
        <pre className="max-h-80 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </section>
          )}

          {nav === "proofs" && (
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Certification</p>
            <h2 className="text-2xl font-semibold text-slate-900">Proof & compliance desk</h2>
            <p className="text-sm text-slate-500">Run GOV.UK checks, log proof packs, and capture audit snapshots for each car.</p>
          </div>
          <p className="text-xs font-semibold text-slate-500">{formData.vehicles.length} vehicles in inventory</p>
        </header>
        <div className="space-y-4">
          {formData.vehicles.map((vehicle, index) => (
            <article key={`proof-${vehicle.id}`} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Vehicle</p>
                  <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {vehicle.vrm ? `VRM ${vehicle.vrm}` : "Add VRM to unlock lookups"}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-900">{vehicle.status}</p>
                  <p>£{vehicle.price.toLocaleString()}</p>
                </div>
              </div>
              <VehicleComplianceWidget vehicle={vehicle} onUpdate={(payload) => updateVehicle(index, payload)} />
            </article>
          ))}
          {formData.vehicles.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No vehicles on file. Add stock in the Car sales tab to unlock certification workflows.
            </p>
          )}
        </div>
      </section>
          )}
        </>
      )}
    </div>
  );
}
