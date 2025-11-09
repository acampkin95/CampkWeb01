import { cache } from "react";
import { getCmsData } from "@/lib/dataStore";
import type { VehicleListing } from "@/types/cms";
import type { MarketComparable, MarketQuery } from "@/types/buying";

const MARKET_BASE = process.env.MARKETCHECK_API_BASE ?? "https://marketcheck-prod.apigee.net/v2/search/car/active";
const MARKET_KEY = process.env.MARKETCHECK_API_KEY;

type MarketCheckListing = {
  heading?: string;
  build?: { trim?: string };
  price?: number;
  miles?: number;
  mileage?: number;
  vdp_url?: string;
  dealer?: { city?: string };
};
const comparablesCache = new Map<string, { expires: number; data: MarketComparable[] }>();
const TTL = 60 * 60 * 1000; // 1 hour

export const fetchMarketComparables = cache(async (query: MarketQuery): Promise<MarketComparable[]> => {
  const cacheKey = JSON.stringify(query).toLowerCase();
  const cached = comparablesCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  let data: MarketComparable[] = [];
  if (MARKET_KEY) {
    try {
      data = await fetchMarketCheckListings(query);
    } catch (error) {
      console.error("MarketCheck lookup failed", error);
    }
  }

  if (data.length === 0) {
    data = await fallbackFromStock(query);
  }

  comparablesCache.set(cacheKey, { data, expires: Date.now() + TTL });
  return data;
});

async function fetchMarketCheckListings(query: MarketQuery): Promise<MarketComparable[]> {
  const url = new URL(MARKET_BASE);
  url.searchParams.set("api_key", MARKET_KEY!);
  url.searchParams.set("car_type", "used");
  url.searchParams.set("country", "UK");
  if (query.make) url.searchParams.set("make", query.make);
  if (query.model) url.searchParams.set("model", query.model);
  if (query.year) {
    url.searchParams.set("start_year", String(query.year - 1));
    url.searchParams.set("end_year", String(query.year + 1));
  }
  url.searchParams.set("rows", "20");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`MarketCheck responded ${response.status}`);
  }
  const payload = (await response.json()) as { listings?: MarketCheckListing[] };
  const listings = Array.isArray(payload?.listings) ? payload.listings : [];
  return listings
    .map((listing) => ({
      source: "MarketCheck",
      title: listing?.heading ?? listing?.build?.trim ?? "Comparable",
      price: Number(listing?.price ?? 0),
      mileage: listing?.miles ?? listing?.mileage,
      url: listing?.vdp_url,
      location: listing?.dealer?.city,
    }))
    .filter((item) => item.price > 0);
}

async function fallbackFromStock(query: MarketQuery): Promise<MarketComparable[]> {
  const data = await getCmsData();
  const matches = data.vehicles.filter((vehicle: VehicleListing) => {
    if (query.make && !vehicle.title.toLowerCase().includes(query.make.toLowerCase())) {
      return false;
    }
    if (query.model && !vehicle.title.toLowerCase().includes(query.model.toLowerCase())) {
      return false;
    }
    if (query.year && Math.abs(vehicle.year - query.year) > 2) {
      return false;
    }
    return true;
  });
  return matches.map((vehicle) => ({
    source: "Campkin stock",
    title: vehicle.title,
    price: vehicle.price,
    mileage: vehicle.mileage,
    url: `/cars`,
    location: "Welwyn Garden City",
  }));
}
