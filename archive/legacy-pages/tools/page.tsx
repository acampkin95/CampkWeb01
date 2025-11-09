import Link from "next/link";

export const metadata = {
  title: "Tools hub | Campkin",
  description: "Compliance + buying workflows for the Campkin team.",
};

const tiles = [
  {
    title: "Compliance desk",
    href: "/tools/lookup",
    description: "DVLA + DVSA checks, VED, ULEZ/CAZ guidance, shareable MOT history.",
  },
  {
    title: "Buying qualification",
    href: "/tools/buying",
    description: "Score damage, pull comps, and script the offer before collecting a PX or outright purchase.",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.5em] text-amber-500">Campkin tools</p>
        <h1 className="text-4xl font-semibold text-slate-900">Trade intelligence suite</h1>
        <p className="text-lg text-slate-600">
          Jump into compliance lookups or valuation workflows built for Hertfordshire buying and sales teams.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{tile.title}</h2>
            <p className="mt-2 text-slate-600">{tile.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
