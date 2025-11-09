import type { RoadTaxEstimate, VehicleTaxInput } from "@/types/vehicle";

const MODERN_REGIME_START = new Date("2017-04-01");
const LEGACY_REGIME_START = new Date("2001-03-01");
const APRIL_2025 = new Date("2025-04-01");
const STANDARD_RATE_2025 = 195;
const EXPENSIVE_CAR_THRESHOLD = 40000;
const EXPENSIVE_CAR_SUPPLEMENT = 410;

type VedBand = {
  code: string;
  min: number;
  max?: number;
  firstYearRate: number;
  label: string;
};

type LegacyBand = {
  code: string;
  min: number;
  max?: number;
  rate: number;
};

const FIRST_YEAR_BANDS: VedBand[] = [
  { code: "A", min: 0, max: 0, firstYearRate: 10, label: "0 g/km" },
  { code: "B", min: 1, max: 50, firstYearRate: 100, label: "1-50 g/km" },
  { code: "C", min: 51, max: 75, firstYearRate: 130, label: "51-75 g/km" },
  { code: "D", min: 76, max: 90, firstYearRate: 270, label: "76-90 g/km" },
  { code: "E", min: 91, max: 100, firstYearRate: 350, label: "91-100 g/km" },
  { code: "F", min: 101, max: 110, firstYearRate: 390, label: "101-110 g/km" },
  { code: "G", min: 111, max: 130, firstYearRate: 440, label: "111-130 g/km" },
  { code: "H", min: 131, max: 150, firstYearRate: 540, label: "131-150 g/km" },
  { code: "I", min: 151, max: 170, firstYearRate: 1360, label: "151-170 g/km" },
  { code: "J", min: 171, max: 190, firstYearRate: 2190, label: "171-190 g/km" },
  { code: "K", min: 191, max: 225, firstYearRate: 3300, label: "191-225 g/km" },
  { code: "L", min: 226, max: 255, firstYearRate: 4680, label: "226-255 g/km" },
  { code: "M", min: 256, max: undefined, firstYearRate: 5490, label: "256+ g/km" },
];

const LEGACY_BANDS: LegacyBand[] = [
  { code: "A", min: 0, max: 100, rate: 20 },
  { code: "B", min: 101, max: 110, rate: 20 },
  { code: "C", min: 111, max: 120, rate: 35 },
  { code: "D", min: 121, max: 130, rate: 165 },
  { code: "E", min: 131, max: 140, rate: 195 },
  { code: "F", min: 141, max: 150, rate: 215 },
  { code: "G", min: 151, max: 165, rate: 265 },
  { code: "H", min: 166, max: 175, rate: 315 },
  { code: "I", min: 176, max: 185, rate: 345 },
  { code: "J", min: 186, max: 200, rate: 395 },
  { code: "K", min: 201, max: 225, rate: 430 },
  { code: "L", min: 226, max: 255, rate: 735 },
  { code: "M", min: 256, max: undefined, rate: 760 },
];

export function calculateVehicleTax(input: VehicleTaxInput): RoadTaxEstimate {
  const notes: string[] = [];
  const registrationDate = parseDate(input.registrationDate);
  const co2 = typeof input.co2 === "number" && !Number.isNaN(input.co2) ? input.co2 : undefined;
  const fuelType = input.fuelType?.toLowerCase() ?? "";
  const isExpensive = typeof input.listPrice === "number" && input.listPrice >= EXPENSIVE_CAR_THRESHOLD;

  if (fuelType.includes("diesel")) {
    notes.push("Non-RDE2 diesels are charged one band higher for the first-year rate.");
  }

  if (isExpensive) {
    notes.push(
      "List price above £40k triggers the £410 expensive car supplement for the first 5 renewals."
    );
  }

  const expensiveSupplement = isExpensive ? EXPENSIVE_CAR_SUPPLEMENT : null;

  if (!registrationDate) {
    if (!co2) {
      notes.push("Registration date and CO₂ data missing, so only the flat standard rate is shown.");
      return {
        regime: "unknown",
        firstYearRate: null,
        annualRate: STANDARD_RATE_2025,
        expensiveCarSupplement: expensiveSupplement,
        totalAnnual: STANDARD_RATE_2025 + (expensiveSupplement ?? 0),
        notes,
      };
    }

    const band = findBand(FIRST_YEAR_BANDS, co2);
    return {
      regime: "unknown",
      bandCode: band?.code,
      bandLabel: band ? `Band ${band.code} (${band.label})` : undefined,
      firstYearRate: band?.firstYearRate ?? null,
      annualRate: STANDARD_RATE_2025,
      expensiveCarSupplement: expensiveSupplement,
      totalAnnual: STANDARD_RATE_2025 + (expensiveSupplement ?? 0),
      notes: [
        "Registration date missing; assuming modern (post-2017) regime for guidance.",
        ...notes,
      ],
    };
  }

  if (registrationDate >= MODERN_REGIME_START) {
    const band = co2 ? findBand(FIRST_YEAR_BANDS, co2) : undefined;
    if (!band) {
      notes.push("CO₂ emissions missing, so first-year rate cannot be derived.");
    } else {
      notes.push("HMRC uprated first-year VED bands apply from 1 April 2025.");
    }

    if (registrationDate < APRIL_2025) {
      notes.push("Vehicle registered before 1 April 2025, so first-year figures are reference only.");
    }

    const annualRate = STANDARD_RATE_2025;
    const totalAnnual = annualRate + (expensiveSupplement ?? 0);

    return {
      regime: "modern",
      bandCode: band?.code,
      bandLabel: band ? `Band ${band.code} (${band.label})` : undefined,
      firstYearRate: band?.firstYearRate ?? null,
      annualRate,
      expensiveCarSupplement: expensiveSupplement,
      totalAnnual,
      notes,
    };
  }

  if (registrationDate >= LEGACY_REGIME_START) {
    const band = co2 ? findBand(LEGACY_BANDS, co2) : undefined;
    if (!band) {
      notes.push("CO₂ data is required for 2001-2017 rates; check the V5C or manufacturer spec.");
    }

    return {
      regime: "legacy",
      bandCode: band?.code,
      bandLabel: band ? `Band ${band.code} (${describeBand(band)})` : undefined,
      firstYearRate: null,
      annualRate: band?.rate ?? null,
      expensiveCarSupplement: null,
      totalAnnual: band?.rate ?? null,
      notes,
    };
  }

  notes.push("Pre-March 2001 cars pay based on engine size (≤1549cc or >1549cc).");
  notes.push("Use DVLA's legacy calculator to confirm the correct disc.");

  return {
    regime: "pre_2001",
    firstYearRate: null,
    annualRate: null,
    expensiveCarSupplement: null,
    totalAnnual: null,
    notes,
  };
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function findBand<T extends VedBand | LegacyBand>(bands: T[], co2: number) {
  return bands.find((band) => co2 >= band.min && (typeof band.max === "undefined" || co2 <= band.max));
}

function describeBand(band: LegacyBand) {
  if (typeof band.max === "undefined") {
    return `${band.min}+ g/km`;
  }
  return `${band.min}-${band.max} g/km`;
}
