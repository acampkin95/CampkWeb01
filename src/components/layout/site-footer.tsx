import Link from "next/link";
import { SiteInfo, Theme } from "@/types/cms";

export function SiteFooter({ siteInfo, theme }: { siteInfo: SiteInfo; theme?: Theme }) {
  const footerLinks = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "FCA No. 123456", href: "#" }
  ];

  return (
    <footer
      className="border-t border-black/10 text-slate-100"
      style={{ backgroundColor: theme?.brandColor ?? "#0f172a" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">{theme?.logoText ?? "Campkin Motor & Warehouse"}</p>
          <p className="text-sm text-slate-400">{siteInfo.address}</p>
          <p className="text-sm text-slate-400">{siteInfo.phone} · {siteInfo.email}</p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-slate-300 md:items-end">
          {footerLinks.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Campkin Trading Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
