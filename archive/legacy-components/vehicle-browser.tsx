"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { VehicleListing } from "@/types/cms";

const mileFormatter = new Intl.NumberFormat("en-GB");
const priceFormatter = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });

export function VehicleBrowser({ vehicles }: { vehicles: VehicleListing[] }) {
  const [search, setSearch] = useState("");
  const [fuel, setFuel] = useState("all");
  const [body, setBody] = useState("all");
  const [status, setStatus] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("recent");

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch = vehicle.title.toLowerCase().includes(search.toLowerCase());
      const matchesFuel = fuel === "all" || vehicle.fuel === fuel;
      const matchesBody = body === "all" || vehicle.body === body;
      const matchesStatus = status === "all" || vehicle.status === status;
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || Number.POSITIVE_INFINITY;
      const matchesPrice = vehicle.price >= min && vehicle.price <= max;
      return matchesSearch && matchesFuel && matchesBody && matchesStatus && matchesPrice;
    });
  }, [vehicles, search, fuel, body, status, minPrice, maxPrice]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    if (sort === "price_asc") return next.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return next.sort((a, b) => b.price - a.price);
    if (sort === "mileage") return next.sort((a, b) => a.mileage - b.mileage);
    return next;
  }, [filtered, sort]);

  const fuelOptions = Array.from(new Set(vehicles.map((vehicle) => vehicle.fuel)));
  const bodyOptions = Array.from(new Set(vehicles.map((vehicle) => vehicle.body)));
  const statusOptions = ["all", ...new Set(vehicles.map((vehicle) => vehicle.status))];

  const clearFilters = () => {
    setSearch("");
    setFuel("all");
    setBody("all");
    setStatus("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Quick search (e.g. BMW 330e, EV, Transit)"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none"
          />
          <div className="flex gap-3">
            <input
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min £"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max £"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
          >
            <option value="recent">Newest listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="mileage">Mileage: Low to High</option>
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Select label="Fuel" value={fuel} onChange={setFuel} options={fuelOptions} />
          <Select label="Body" value={body} onChange={setBody} options={bodyOptions} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    status === option
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {option === "all" ? "All stock" : option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Showing <span className="font-semibold text-slate-900">{sorted.length}</span> of {vehicles.length} vehicles
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 px-4 py-1 font-semibold text-slate-700"
            >
              Reset filters
            </button>
            <Link
              href="/tools/buying"
              className="rounded-full border border-slate-900 px-4 py-1 font-semibold text-slate-900"
            >
              Run buying check
            </Link>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        {sorted.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
        {sorted.length === 0 && (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            No vehicles match that criteria right now. Try clearing filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
      >
        <option value="all">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function VehicleCard({ vehicle }: { vehicle: VehicleListing }) {
  const latestCompliance = vehicle.complianceHistory
    ? [...vehicle.complianceHistory].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
    : undefined;
  const proofCount = vehicle.complianceProofs?.length ?? 0;

  return (
    <article className="grid gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl md:grid-cols-[280px_1fr_auto]">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={vehicle.images[0] ?? "https://images.unsplash.com/photo-1503376780353-7e6692767b70"}
          alt={vehicle.title}
          fill
          className="object-cover"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
          {vehicle.status}
        </div>
      </div>
      <div className="flex flex-col gap-3 text-sm text-slate-600">
        <h3 className="text-2xl font-semibold text-slate-900">{vehicle.title}</h3>
        <p>
          {vehicle.year} · {mileFormatter.format(vehicle.mileage)} miles · {vehicle.fuel} · {vehicle.transmission}
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">VRM {vehicle.vrm ?? "Awaiting"}</p>
        <ul className="flex flex-wrap gap-2 text-xs text-slate-500">
          {vehicle.features.slice(0, 4).map((feature) => (
            <li key={feature} className="rounded-full bg-slate-100 px-3 py-1">
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          {latestCompliance && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              ULEZ {latestCompliance.ulez ?? "TBC"}
            </span>
          )}
          {proofCount > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
              {proofCount} proof{proofCount === 1 ? "" : "s"} on file
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-4 text-right">
        <div>
          <p className="text-3xl font-bold text-slate-900">{priceFormatter.format(vehicle.price)}</p>
          {vehicle.listPrice && vehicle.listPrice !== vehicle.price && (
            <p className="text-xs text-slate-400">List £{vehicle.listPrice.toLocaleString()}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
          {latestCompliance && (
            <p>Snapshot: {new Date(latestCompliance.recordedAt).toLocaleDateString("en-GB")}</p>
          )}
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
