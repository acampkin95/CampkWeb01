"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { VehicleListing } from "@/types/cms";
import { Search, SlidersHorizontal } from "lucide-react";

interface CarsFilterProps {
  vehicles: VehicleListing[];
}

export function CarsFilter({ vehicles }: CarsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fuelType: "all",
    transmission: "all",
    minPrice: 0,
    maxPrice: 10000,
    status: "all",
  });

  // Extract unique values for filters
  const fuelTypes = useMemo(() => {
    const types = new Set(vehicles.map((v) => v.fuel));
    return Array.from(types);
  }, [vehicles]);

  const transmissionTypes = useMemo(() => {
    const types = new Set(vehicles.map((v) => v.transmission));
    return Array.from(types);
  }, [vehicles]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(vehicles.map((v) => v.status));
    return Array.from(statuses);
  }, [vehicles]);

  const priceRange = useMemo(() => {
    const prices = vehicles.map((v) => v.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [vehicles]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        vehicle.title.toLowerCase().includes(searchLower) ||
        vehicle.description.toLowerCase().includes(searchLower) ||
        vehicle.features.some((f) => f.toLowerCase().includes(searchLower));

      // Fuel type filter
      const matchesFuel = filters.fuelType === "all" || vehicle.fuel === filters.fuelType;

      // Transmission filter
      const matchesTransmission = filters.transmission === "all" || vehicle.transmission === filters.transmission;

      // Price filter
      const matchesPrice = vehicle.price >= filters.minPrice && vehicle.price <= filters.maxPrice;

      // Status filter
      const matchesStatus = filters.status === "all" || vehicle.status === filters.status;

      return matchesSearch && matchesFuel && matchesTransmission && matchesPrice && matchesStatus;
    });
  }, [vehicles, searchTerm, filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      fuelType: "all",
      transmission: "all",
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      status: "all",
    });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "all" && v !== priceRange.min && v !== priceRange.max).length;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass-panel p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by make, model, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--chelsea-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--chelsea-blue)] focus:ring-opacity-20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border-2 border-[var(--chelsea-blue)] px-6 py-2.5 text-sm font-semibold text-[var(--chelsea-blue)] hover:bg-[var(--chelsea-blue)] hover:text-white transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-[var(--orange-cta)] px-2 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Fuel Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange("fuelType", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--chelsea-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--chelsea-blue)] focus:ring-opacity-20"
              >
                <option value="all">All Fuel Types</option>
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transmission</label>
              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange("transmission", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--chelsea-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--chelsea-blue)] focus:ring-opacity-20"
              >
                <option value="all">All Transmissions</option>
                {transmissionTypes.map((trans) => (
                  <option key={trans} value={trans}>
                    {trans}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Max Price: £{filters.maxPrice.toLocaleString()}
              </label>
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                step={100}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Availability</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--chelsea-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--chelsea-blue)] focus:ring-opacity-20"
              >
                <option value="all">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <div className="flex items-end md:col-span-2 lg:col-span-4">
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[var(--chelsea-blue)] hover:text-[var(--orange-cta)] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>
          Showing <span className="font-semibold text-[var(--chelsea-blue)]">{filteredVehicles.length}</span> of{" "}
          <span className="font-semibold">{vehicles.length}</span> vehicles
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="grid gap-4">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <article key={vehicle.id} className="glass-panel p-6 text-sm text-slate-600 hover:shadow-xl transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 text-slate-900">
                <h2 className="text-2xl font-semibold text-[var(--chelsea-blue)]">
                  <Link href={`/cars/${vehicle.id}`} className="hover:text-[var(--orange-cta)] transition-colors">
                    {vehicle.title}
                  </Link>
                </h2>
                <p className="text-xl font-semibold text-[var(--chelsea-blue)]">£{vehicle.price.toLocaleString()}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{vehicle.status}</p>
              <p className="mt-2 text-sm">
                {vehicle.year} · {vehicle.fuel} · {vehicle.transmission} · {vehicle.mileage.toLocaleString()} miles
              </p>
              <p className="mt-3 text-sm">{vehicle.description}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                {vehicle.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="rounded-full border border-slate-200 px-3 py-1">
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  href={`/cars/${vehicle.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--chelsea-blue)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--orange-cta)] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="glass-panel p-12 text-center">
            <p className="text-lg font-semibold text-slate-900 mb-2">No vehicles found</p>
            <p className="text-sm text-slate-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="cta-primary inline-flex rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
