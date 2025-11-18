import type { CSSProperties } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getCmsData } from "@/lib/dataStore";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://campkinmotors.co.uk";
const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ??
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1800&q=80";
const spaceGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/SpaceGrotesk-Variable.woff2",
      style: "normal",
      weight: "300 700",
    },
  ],
  display: "swap",
  variable: "--font-space-grotesk",
});

const jetBrainsMono = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono-Variable.woff2",
      style: "normal",
      weight: "100 800",
    },
  ],
  display: "swap",
  variable: "--font-jetbrains-mono",
});
const BASE_DESCRIPTION =
  "Phil Campkin's independent Hertfordshire campus for flexible warehouse lets, car sales, EV-friendly repairs, and compliance tools.";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getCmsData();
  const heroSubtitle = data.siteInfo?.heroSubtitle ?? "Warehouse + workshop support";
  const tagline = data.siteInfo?.tagline ?? "Phil Campkin's independent motor campus";
  const description = `${tagline} · ${heroSubtitle}` || BASE_DESCRIPTION;
  const ogImage = data.theme?.heroImage ?? DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Campkin Motor & Warehouse",
      template: "%s | Campkin Motor & Warehouse",
    },
    description,
    keywords: [
      "Hertfordshire car dealer",
      "Phil Campkin",
      "warehouse to let",
      "independent garage",
      "DVLA lookup",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title: "Campkin Motor & Warehouse",
      description,
      type: "website",
      url: SITE_URL,
      siteName: "Campkin Motor & Warehouse",
      locale: "en_GB",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Campkin Motor & Warehouse showroom",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Campkin Motor & Warehouse",
      description,
      images: [ogImage],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Campkin",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getCmsData();
  const { siteInfo, theme, vehicles = [], services = [] } = data;

  const cssVars = {
    "--brand-color": theme?.brandColor,
    "--accent-color": theme?.accentColor,
    "--muted-color": theme?.mutedColor,
    "--background-color": theme?.backgroundColor,
  } satisfies Record<string, string | undefined>;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["AutoDealer", "AutomotiveBusiness"],
    name: "Campkin Motor & Warehouse",
    url: SITE_URL,
    description: siteInfo?.heroSubtitle ?? BASE_DESCRIPTION,
    telephone: siteInfo?.phone,
    email: siteInfo?.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo?.address,
      addressRegion: "Hertfordshire",
      addressCountry: "GB",
    },
    areaServed: ["Hertfordshire", "Bedfordshire", "North London"],
    founder: {
      "@type": "Person",
      name: "Phil Campkin",
    },
    openingHours: siteInfo?.hours,
    serviceOffered: services.slice(0, 6).map((service) => ({
      "@type": "Service",
      name: service.name,
      description: service.description,
    })),
    makesOffer: vehicles.slice(0, 4).map((vehicle) => ({
      "@type": "Offer",
      priceCurrency: "GBP",
      price: vehicle.price,
      availability:
        vehicle.status === "In Stock"
          ? "https://schema.org/InStock"
          : vehicle.status === "Reserved"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
      itemOffered: {
        "@type": "Vehicle",
        name: vehicle.title,
        vehicleModelDate: vehicle.year,
        vehicleTransmission: vehicle.transmission,
        fuelType: vehicle.fuel,
        bodyType: vehicle.body,
        mileageFromOdometer: {
          "@type": "QuantitativeValue",
          value: vehicle.mileage,
          unitCode: "SMI",
        },
      },
    })),
  };

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-slate-50 antialiased" style={cssVars as CSSProperties}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Script id="org-schema" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
        <SiteHeader siteInfo={siteInfo} theme={theme} />
        <main id="main-content" className="mx-auto min-h-screen max-w-6xl space-y-12 px-6 py-12">
          {children}
        </main>
        <SiteFooter siteInfo={siteInfo} theme={theme} />
        <Analytics />
      </body>
    </html>
  );
}
