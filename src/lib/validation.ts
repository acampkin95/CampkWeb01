import { z } from "zod";

export const sectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sizeSqFt: z.number().positive(),
  availability: z.enum(["Available", "Reserved", "Let", "In Prep", "Coming Soon"]),
  pricePerMonth: z.number().nonnegative(),
  features: z.array(z.string())
});

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceFrom: z.number().nonnegative()
});

const complianceProofSchema = z.object({
  id: z.string(),
  type: z.string(),
  reference: z.string(),
  url: z.string().url().optional(),
  addedAt: z.string(),
});

const complianceSnapshotSchema = z.object({
  id: z.string(),
  vrm: z.string().optional(),
  recordedAt: z.string(),
  analyst: z.string().optional(),
  summary: z.string().optional(),
  tax: z
    .object({
      regime: z.string().optional(),
      firstYearRate: z.number().nullable().optional(),
      totalAnnual: z.number().nullable().optional(),
      expensiveCarSupplement: z.number().nullable().optional(),
    })
    .optional(),
  ulez: z.string().optional(),
  caz: z.string().optional(),
  notes: z.string().optional(),
});

export const vehicleSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().nonnegative(),
  listPrice: z.number().nonnegative().optional(),
  mileage: z.number().nonnegative(),
  fuel: z.string(),
  transmission: z.string(),
  year: z.number().int().min(1980),
  vrm: z.string().optional(),
  images: z.array(z.string()).default([]),
  description: z.string(),
  status: z.enum(["In Stock", "Reserved", "In Prep", "Sold"]),
  body: z.string(),
  colour: z.string(),
  features: z.array(z.string()),
  complianceNotes: z.string().optional(),
  complianceProofs: z.array(complianceProofSchema).optional(),
  complianceHistory: z.array(complianceSnapshotSchema).optional(),
});

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  quote: z.string()
});

export const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string()
});

export const leadSchema = z.object({
  channel: z.enum(["warehouse", "vehicle"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  vehicleId: z.string().optional(),
});

export const cmsSchema = z.object({
  siteInfo: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string().email(),
    hours: z.string(),
    heroBadge: z.string().optional(),
    tagline: z.string().optional(),
    mapUrl: z.string().url().optional(),
    heroStats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          detail: z.string(),
        })
      )
      .optional(),
  }),
  warehouse: z.object({
    headline: z.string(),
    subheading: z.string(),
    sections: z.array(sectionSchema).length(8)
  }),
  theme: z.object({
    brandColor: z.string(),
    accentColor: z.string(),
    mutedColor: z.string(),
    backgroundColor: z.string(),
    heroImage: z.string(),
    heroOverlay: z.string(),
    logoText: z.string(),
  }),
  performance: z
    .object({
      stats: z.array(z.object({
        label: z.string(),
        value: z.string(),
        description: z.string()
      })),
      badges: z.array(z.string())
    })
    .optional(),
  services: z.array(serviceSchema).min(3),
  vehicles: z.array(vehicleSchema),
  testimonials: z.array(testimonialSchema),
  faqs: z.array(faqSchema),
  storefront: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    highlights: z.array(
      z.object({
        eyebrow: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
  valueProps: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    ),
  }),
  compliancePromo: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    bullets: z.array(z.string()),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
  contactCta: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    formCopy: z.string(),
  }),
});

export type CmsInput = z.infer<typeof cmsSchema>;
