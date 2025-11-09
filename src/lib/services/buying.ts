import { fetchVehicleLookup } from "@/lib/services/vehicle";
import { fetchMarketComparables } from "@/lib/services/market";
import type { BuyingRequest, BuyingResult, DamageScores } from "@/types/buying";
import { DAMAGE_KEYS } from "@/types/buying";

export async function evaluateBuyingRequest(payload: BuyingRequest): Promise<BuyingResult> {
  if (!payload.make && !payload.vrm) {
    throw new Error("Provide a make/model or VRM");
  }

  const damageScores = normaliseDamage(payload.damage ?? {});

  let vehicleProfile: Awaited<ReturnType<typeof fetchVehicleLookup>> | null = null;
  if (payload.vrm) {
    try {
      vehicleProfile = await fetchVehicleLookup(payload.vrm, { listPrice: payload.askingPrice });
    } catch (error) {
      console.warn("Buying request lookup failed", error);
    }
  }

  const comparables = await fetchMarketComparables({
    make: payload.make,
    model: payload.model,
    year: payload.year,
    mileage: payload.mileage,
    vrm: payload.vrm,
  });

  const compsAverage =
    comparables.length > 0 ? comparables.reduce((sum, comp) => sum + comp.price, 0) / comparables.length : 0;

  const damageAverage = DAMAGE_KEYS.reduce((sum, key) => sum + damageScores[key], 0) / DAMAGE_KEYS.length;
  const damagePenalty = Math.min(Math.max((damageAverage - 1) * 0.04, 0), 0.35);

  const basis = compsAverage || payload.askingPrice || 0;
  const adjustedMid = basis * (1 - damagePenalty);
  const offerRange = {
    min: Math.round(adjustedMid ? adjustedMid * 0.97 : basis * 0.95),
    max: Math.round(adjustedMid ? adjustedMid * 1.02 : basis * 1.01),
  };

  const status = damageAverage <= 2.5 ? "Green" : damageAverage < 3.5 ? "Amber" : "Red";
  const talkingPoint = buildTalkingPoint(status, damageAverage, payload.notes);

  return {
    status,
    damageAverage,
    offerRange,
    comparables,
    talkingPoint,
    vehicleProfile: vehicleProfile?.dvla
      ? {
          make: vehicleProfile.dvla.make,
          model: vehicleProfile.dvla.model,
          colour: vehicleProfile.dvla.colour,
          fuelType: vehicleProfile.dvla.fuelType,
          registrationDate: vehicleProfile.dvla.registrationDate,
        }
      : undefined,
    motTests: vehicleProfile?.motTests?.slice(0, 3).map((test) => ({
      completedDate: test.completedDate,
      testResult: test.testResult,
    })),
  };
}

function normaliseDamage(damage: DamageScores) {
  return DAMAGE_KEYS.reduce((acc, key) => {
    const value = damage[key];
    acc[key] = value && value >= 1 && value <= 5 ? Number(value) : 1;
    return acc;
  }, {} as Record<(typeof DAMAGE_KEYS)[number], number>);
}

function buildTalkingPoint(status: BuyingResult["status"], damageAverage: number, notes?: string) {
  const base =
    status === "Green"
      ? "Looks retail-ready — lean into fast payment and collection."
      : status === "Amber"
        ? "Flag minor prep items and keep offer subject to inspection."
        : "High prep exposure — emphasise deductions and conditional offer.";
  const detail = `Damage index ${damageAverage.toFixed(1)} / 5`;
  return notes ? `${base} ${detail}. Seller note: ${notes}` : `${base} ${detail}.`;
}
