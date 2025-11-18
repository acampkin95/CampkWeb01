"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteInfo, Theme } from "@/types/cms";

const links = [
  { href: "/", label: "Home" },
  { href: "/sublets", label: "Sublet listings" },
  { href: "/cars", label: "Available cars" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ siteInfo, theme }: { siteInfo: SiteInfo; theme?: Theme }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 min-w-0 flex-1 sm:gap-3">
          <button
            type="button"
            className="flex-shrink-0 rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span className="block h-0.5 w-5 bg-current"></span>
            <span className="mt-1 block h-0.5 w-5 bg-current"></span>
            <span className="mt-1 block h-0.5 w-5 bg-current"></span>
          </button>
          <div className="min-w-0 flex-1">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight sm:text-xl block truncate"
              style={{ color: theme?.brandColor ?? "#0f172a" }}
            >
              {theme?.logoText ?? "Campkin Motor & Warehouse"}
            </Link>
            <p className="text-xs text-slate-500 hidden sm:block truncate">{siteInfo.tagline ?? siteInfo.address}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-2 text-sm font-medium lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/admin" className="rounded-full px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-900 whitespace-nowrap">
            Admin
          </Link>
        </nav>
        <div className="hidden flex-col text-right text-sm font-semibold text-slate-900 xl:flex">
          <a href={`tel:${siteInfo.phone}`} className="leading-tight whitespace-nowrap">
            {siteInfo.phone}
          </a>
          <span className="text-xs font-normal text-slate-500 whitespace-nowrap">{siteInfo.hours}</span>
        </div>
        <Link
          href="/contact"
          className="flex-shrink-0 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm sm:px-4 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Talk to Phil</span>
          <span className="sm:hidden">Contact</span>
        </Link>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="text-xs text-slate-400">
              Admin
            </Link>
            <a href={`tel:${siteInfo.phone}`} className="pt-2 text-slate-500">
              {siteInfo.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
