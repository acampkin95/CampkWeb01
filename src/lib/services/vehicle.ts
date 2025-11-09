import { cache } from "react";
import { calculateVehicleTax } from "@/lib/calculators/ved";
import { VehicleLookupResult, DvlaVehicle, MotTest, AirQualityResult } from "@/types/vehicle";

const DVLA_ENDPOINT = "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";
const DVSA_ENDPOINT = "https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests";
const TFL_VEHICLE_ENDPOINT = "https://api.tfl.gov.uk/VehicleReg";
const CAZ_API_BASE = process.env.CAZ_API_BASE ?? "https://api.drive-clean-air-zone.service.gov.uk/vehicles";
const ULEZ_REFERENCE_URL = "https://tfl.gov.uk/modes/driving/ultra-low-emission-zone";
const CAZ_REFERENCE_URL = "https://www.gov.uk/guidance/driving-in-a-clean-air-zone";
const COMPLIANCE_TTL = 12 * 60 * 60 * 1000; // 12 hours

type CachedCompliance = {
  expires: number;
  ulez?: AirQualityResult;
  caz?: AirQualityResult;
};

const complianceCache = new Map<string, CachedCompliance>();

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Lookup failed (${response.status}): ${text || response.statusText}`);
  }
  return (await response.json()) as T;
}

type FetchOptions = { listPrice?: number | null };

export const fetchVehicleLookup = cache(async (vrm: string, options?: FetchOptions): Promise<VehicleLookupResult> => {
  const registrationNumber = vrm.trim().toUpperCase();
  if (!registrationNumber) {
    throw new Error("Registration number is required.");
  }

  const dvlaKey = process.env.DVLA_VES_API_KEY;
  const dvsaKey = process.env.DVSA_MOT_API_KEY;

  if (!dvlaKey || !dvsaKey) {
    throw new Error("Vehicle lookup keys are not configured.");
  }

  const dvlaPromise = fetchJson<DvlaVehicle>(DVLA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": dvlaKey,
    },
    body: JSON.stringify({ registrationNumber }),
    cache: "no-store",
  });

  const dvsaPromise = fetchJson<{ motTests?: MotTest[] }>(`${DVSA_ENDPOINT}?registration=${registrationNumber}`, {
    headers: {
      Accept: "application/json+v6",
      "x-api-key": dvsaKey,
    },
    cache: "no-store",
  });

  const [dvla, dvsa] = await Promise.allSettled([dvlaPromise, dvsaPromise]);

  if (dvla.status === "rejected") {
    throw dvla.reason;
  }

  const motTests = dvsa.status === "fulfilled" ? dvsa.value.motTests ?? [] : [];

  const tax = calculateVehicleTax({
    co2: dvla.value.co2Emissions,
    registrationDate: dvla.value.registrationDate,
    fuelType: dvla.value.fuelType,
    listPrice: options?.listPrice ?? null,
  });

  const liveCompliance = await fetchLiveCompliance(registrationNumber);

  const ulez = liveCompliance?.ulez ?? assessUlezHeuristics(dvla.value);
  const caz = liveCompliance?.caz ?? assessCazHeuristics(dvla.value);

  return { dvla: dvla.value, motTests, tax, ulez, caz };
});

async function fetchLiveCompliance(vrm: string) {
  const cached = complianceCache.get(vrm);
  if (cached && cached.expires > Date.now()) {
    return cached;
  }

  const [ulez, caz] = await Promise.all([fetchTflUlez(vrm).catch(logComplianceError), fetchGovCaz(vrm).catch(logComplianceError)]);

  const payload: CachedCompliance = {
    expires: Date.now() + COMPLIANCE_TTL,
    ulez: ulez ?? undefined,
    caz: caz ?? undefined,
  };
  complianceCache.set(vrm, payload);
  return payload;
}

type TflVehicleResponse = {
  charge?: number | string;
  dailyCharge?: number | string;
  complianceOutcome?: { charge?: number | string; message?: string };
  message?: string;
  isCompliant?: boolean;
  isULEZCompliant?: boolean;
};

type CazZone = { name?: string; charge?: number | string; amount?: number | string };

type CazResponse = {
  charge?: number | string;
  cleanAirZones?: CazZone[];
  charges?: CazZone[];
};

async function fetchTflUlez(vrm: string): Promise<AirQualityResult | null> {
  const key = process.env.TFL_APP_KEY;
  if (!key) return null;
  const url = new URL(`${TFL_VEHICLE_ENDPOINT}/${vrm}`);
  url.searchParams.set("app_key", key);
  if (process.env.TFL_APP_ID) {
    url.searchParams.set("app_id", process.env.TFL_APP_ID as string);
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) {
      return {
        scheme: "London ULEZ (TfL)",
        status: "Unknown",
        notes: "TfL could not find this VRM.",
        referenceUrl: ULEZ_REFERENCE_URL,
      };
    }
    const text = await response.text();
    throw new Error(`TfL VehicleReg failed (${response.status}): ${text}`);
  }
  const payload = (await response.json()) as TflVehicleResponse;
  return interpretTflResponse(payload);
}

function interpretTflResponse(payload: TflVehicleResponse): AirQualityResult {
  const scheme = "London ULEZ (TfL)";
  const charge = Number(payload?.charge ?? payload?.dailyCharge ?? payload?.complianceOutcome?.charge ?? 0);
  const compliantFlag =
    typeof payload?.isCompliant === "boolean"
      ? payload.isCompliant
      : typeof payload?.isULEZCompliant === "boolean"
        ? payload.isULEZCompliant
        : charge === 0;
  const status: AirQualityResult["status"] = compliantFlag ? "Compliant" : "Chargeable";
  const reason =
    payload?.message ??
    payload?.complianceOutcome?.message ??
    (status === "Compliant" ? "TfL reports no daily charge." : "TfL indicates a daily ULEZ charge applies.");
  return {
    scheme,
    status,
    notes: reason,
    referenceUrl: ULEZ_REFERENCE_URL,
  };
}

async function fetchGovCaz(vrm: string): Promise<AirQualityResult | null> {
  const key = process.env.CAZ_API_KEY;
  if (!key) return null;
  const url = `${CAZ_API_BASE.replace(/\/$/, "")}/${encodeURIComponent(vrm)}`;
  const response = await fetch(url, {
    headers: {
      "x-api-key": key,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 404) {
      return {
        scheme: "England CAZ (JAQU)",
        status: "Unknown",
        notes: "JAQU service could not find this VRM.",
        referenceUrl: CAZ_REFERENCE_URL,
      };
    }
    const text = await response.text();
    throw new Error(`CAZ API failed (${response.status}): ${text}`);
  }
  const payload = (await response.json()) as CazResponse;
  const zones = Array.isArray(payload?.cleanAirZones) ? payload.cleanAirZones : payload?.charges;
  const hasCharge = Array.isArray(zones)
    ? zones.some((zone) => Number(zone?.charge ?? zone?.amount ?? 0) > 0)
    : Boolean(payload?.charge);
  const status: AirQualityResult["status"] = hasCharge ? "Chargeable" : "Compliant";
  const zoneNames = Array.isArray(zones) ? zones.map((zone) => zone?.name).filter(Boolean).join(", ") : undefined;
  const notes = zoneNames
    ? `${zoneNames} ${status === "Chargeable" ? "will" : "will not"} bill this vehicle.`
    : status === "Chargeable"
      ? "One or more CAZ operators report a daily charge."
      : "JAQU reports no CAZ charge.";
  return {
    scheme: "England CAZ (JAQU)",
    status,
    notes,
    referenceUrl: CAZ_REFERENCE_URL,
  };
}

function logComplianceError(error: unknown) {
  console.error("Compliance API error", error);
  return null;
}

function assessUlezHeuristics(dvla: DvlaVehicle): AirQualityResult {
  const fuel = dvla.fuelType?.toLowerCase() ?? "";
  if (fuel.includes("electric") || fuel.includes("hydrogen")) {
    return {
      scheme: "London ULEZ",
      status: "Compliant",
      notes: "Zero-emission powertrains are exempt from ULEZ charges.",
      referenceUrl: ULEZ_REFERENCE_URL,
    };
  }
  const euro = deriveEuroStage(dvla);
  if (euro == null) {
    return {
      scheme: "London ULEZ",
      status: "Unknown",
      notes: "Missing Euro status – confirm using TfL's vehicle checker.",
      referenceUrl: ULEZ_REFERENCE_URL,
    };
  }
  const required = fuel.includes("diesel") ? 6 : 4;
  const compliant = euro >= required;
  return {
    scheme: "London ULEZ",
    status: compliant ? "Compliant" : "Chargeable",
    notes: compliant
      ? `Meets Euro ${required}+ (${formatEuro(euro)}) requirement for ${fuel.includes("diesel") ? "diesel" : "petrol"} vehicles.`
      : `Below Euro ${required}. TfL will levy the daily ULEZ charge unless retrofitted and certified.`,
    referenceUrl: ULEZ_REFERENCE_URL,
  };
}

function assessCazHeuristics(dvla: DvlaVehicle): AirQualityResult {
  const fuel = dvla.fuelType?.toLowerCase() ?? "";
  if (fuel.includes("electric") || fuel.includes("hydrogen")) {
    return {
      scheme: "England CAZ",
      status: "Compliant",
      notes: "Zero-tailpipe-emission vehicles are exempt from CAZ charges.",
      referenceUrl: CAZ_REFERENCE_URL,
    };
  }
  const euro = deriveEuroStage(dvla);
  if (euro == null) {
    return {
      scheme: "England CAZ",
      status: "Unknown",
      notes: "Missing Euro status – confirm via the government CAZ portal.",
      referenceUrl: CAZ_REFERENCE_URL,
    };
  }
  const required = fuel.includes("diesel") ? 6 : 4;
  const compliant = euro >= required;
  return {
    scheme: "England CAZ",
    status: compliant ? "Compliant" : "Chargeable",
    notes: compliant
      ? `Euro ${formatEuro(euro)} meets the Class D CAZ threshold of Euro ${required}.`
      : `Euro ${formatEuro(euro)} falls short of the Euro ${required} threshold used by Bath, Birmingham, Portsmouth, Bristol and other CAZ cities.`,
    referenceUrl: CAZ_REFERENCE_URL,
  };
}

function deriveEuroStage(dvla: DvlaVehicle) {
  const direct = parseEuroStage(dvla.euroStatus);
  if (direct) return direct;
  const dateValue = dvla.registrationDate ? new Date(dvla.registrationDate) : null;
  const year = dateValue && !Number.isNaN(dateValue.valueOf()) ? dateValue.getFullYear() : null;
  if (!year) return null;
  const fuel = dvla.fuelType?.toLowerCase() ?? "";
  if (fuel.includes("diesel")) {
    if (year >= 2015) return 6;
    if (year >= 2011) return 5;
    if (year >= 2006) return 4;
    if (year >= 2000) return 3;
  } else {
    if (year >= 2014) return 6;
    if (year >= 2009) return 5;
    if (year >= 2005) return 4;
    if (year >= 2000) return 3;
  }
  return null;
}

function parseEuroStage(value?: string | null) {
  if (!value) return null;
  const match = value.match(/([0-9]+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatEuro(value?: number | null) {
  if (!value) return "N/A";
  return `Euro ${value}`;
}
