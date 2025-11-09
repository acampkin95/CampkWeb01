export type WarehouseSection = {
  id: string;
  name: string;
  sizeSqFt: number;
  availability: "Available" | "Reserved" | "Let" | "In Prep" | "Coming Soon";
  pricePerMonth: number;
  features: string[];
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  priceFrom: number;
};

export type ComplianceProof = {
  id: string;
  type: string;
  reference: string;
  url?: string;
  addedAt: string;
};

export type ComplianceSnapshot = {
  id: string;
  vrm?: string;
  recordedAt: string;
  analyst?: string;
  summary?: string;
  tax?: {
    regime?: string;
    firstYearRate?: number | null;
    totalAnnual?: number | null;
    expensiveCarSupplement?: number | null;
  };
  ulez?: string;
  caz?: string;
  notes?: string;
};

export type VehicleListing = {
  id: string;
  title: string;
  price: number;
  listPrice?: number;
  mileage: number;
  fuel: string;
  transmission: string;
  year: number;
  vrm?: string;
  images: string[];
  description: string;
  status: "In Stock" | "Reserved" | "In Prep" | "Sold";
  body: string;
  colour: string;
  features: string[];
  complianceNotes?: string;
  complianceProofs?: ComplianceProof[];
  complianceHistory?: ComplianceSnapshot[];
};

export type HeroStat = {
  label: string;
  value: string;
  detail: string;
};

export type SiteInfo = {
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroBadge?: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapUrl?: string;
  heroStats?: HeroStat[];
};

export type Theme = {
  brandColor: string;
  accentColor: string;
  mutedColor: string;
  backgroundColor: string;
  heroImage: string;
  heroOverlay: string;
  logoText: string;
};

export type PerformanceMetrics = {
  stats: Array<{ label: string; value: string; description: string }>;
  badges: string[];
};

export type CtaLink = {
  label: string;
  href: string;
};

export type PromoSection = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
};

export type StorefrontSection = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: Array<{ eyebrow: string; title: string; description: string }>;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
};

export type ValuePropConfig = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ id: string; title: string; description: string; icon: string }>;
};

export type ContactCta = {
  eyebrow: string;
  title: string;
  description: string;
  formCopy: string;
};

export type Testimonial = {
  id: string;
  name: string;
  quote: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type CmsData = {
  siteInfo: SiteInfo;
  warehouse: {
    headline: string;
    subheading: string;
    sections: WarehouseSection[];
  };
  theme: Theme;
  performance?: PerformanceMetrics;
  services: ServiceItem[];
  vehicles: VehicleListing[];
  testimonials: Testimonial[];
  faqs: Faq[];
  storefront: StorefrontSection;
  valueProps: ValuePropConfig;
  compliancePromo: PromoSection;
  contactCta: ContactCta;
};
