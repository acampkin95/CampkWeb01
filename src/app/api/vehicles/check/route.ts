import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/vehicles/check
 * Check a vehicle by VRM (integrates with DVLA) and provide audit information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vrm, vin } = body;

    if (!vrm && !vin) {
      return NextResponse.json(
        { success: false, error: "VRM or VIN required" },
        { status: 400 }
      );
    }

    // Sanitize VRM
    const cleanVRM = vrm?.replace(/\s/g, "").toUpperCase();

    // 1. Check DVLA
    let dvlaData = null;
    if (cleanVRM && process.env.DVLA_VES_API_KEY) {
      try {
        const dvlaResponse = await fetch(
          "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
          {
            method: "POST",
            headers: {
              "x-api-key": process.env.DVLA_VES_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ registrationNumber: cleanVRM }),
          }
        );

        if (dvlaResponse.ok) {
          dvlaData = await dvlaResponse.json();
        }
      } catch (error) {
        console.error("DVLA lookup failed:", error);
      }
    }

    // 2. Check MOT History
    let motData = null;
    if (cleanVRM && process.env.DVSA_MOT_API_KEY) {
      try {
        const motResponse = await fetch(
          `https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests?registration=${cleanVRM}`,
          {
            headers: {
              "x-api-key": process.env.DVSA_MOT_API_KEY,
            },
          }
        );

        if (motResponse.ok) {
          motData = await motResponse.json();
        }
      } catch (error) {
        console.error("MOT lookup failed:", error);
      }
    }

    // 3. Try to match with database
    let matchedMake = null;
    let matchedModel = null;

    if (dvlaData?.make) {
      matchedMake = await prisma.vehicleMake.findFirst({
        where: {
          name: {
            equals: dvlaData.make,
            mode: "insensitive",
          },
        },
      });

      if (matchedMake && dvlaData.model) {
        matchedModel = await prisma.vehicleModel.findFirst({
          where: {
            makeId: matchedMake.id,
            name: {
              contains: dvlaData.model,
              mode: "insensitive",
            },
          },
          include: {
            configurations: {
              where: {
                ...(dvlaData.fuelType
                  ? { fuel: mapDVLAFuelType(dvlaData.fuelType) as any }
                  : {}),
                yearStart: { lte: dvlaData.yearOfManufacture || 9999 },
                OR: [
                  { yearEnd: { gte: dvlaData.yearOfManufacture || 0 } },
                  { yearEnd: null },
                ],
              },
              take: 5,
            },
          },
        });
      }
    }

    // 4. Estimated valuation (basic calculation - integrate with Glass's Guide or CAP in production)
    let estimatedValue = null;
    if (dvlaData && motData) {
      estimatedValue = calculateEstimatedValue(dvlaData, motData);
    }

    // 5. Audit flags
    const auditFlags = [];

    if (dvlaData) {
      // Check if taxed
      if (dvlaData.taxStatus !== "Taxed") {
        auditFlags.push({
          severity: "warning",
          message: `Tax status: ${dvlaData.taxStatus}`,
        });
      }

      // Check MOT
      if (dvlaData.motStatus === "No details held by DVLA") {
        auditFlags.push({
          severity: "info",
          message: "No MOT details (may be new vehicle or exempt)",
        });
      } else if (dvlaData.motStatus !== "Valid") {
        auditFlags.push({
          severity: "error",
          message: `MOT status: ${dvlaData.motStatus}`,
        });
      }

      // Check for written off
      if (dvlaData.markedForExport) {
        auditFlags.push({
          severity: "error",
          message: "Vehicle marked for export",
        });
      }
    }

    if (motData) {
      const latestMot = motData[0]?.motTests?.[0];
      if (latestMot) {
        // Check mileage consistency
        const mileageHistory = motData[0]?.motTests?.map(
          (test: any) => test.odometerValue
        );
        if (hasMileageDiscrepancy(mileageHistory)) {
          auditFlags.push({
            severity: "error",
            message: "Mileage discrepancy detected",
          });
        }

        // Check for advisories
        const advisories = latestMot.rfrAndComments?.filter(
          (c: any) => c.type === "ADVISORY"
        );
        if (advisories && advisories.length > 3) {
          auditFlags.push({
            severity: "warning",
            message: `${advisories.length} advisories on latest MOT`,
          });
        }

        // Check for dangerous defects
        const dangerousDefects = latestMot.rfrAndComments?.filter(
          (c: any) => c.type === "FAIL" && c.dangerous
        );
        if (dangerousDefects && dangerousDefects.length > 0) {
          auditFlags.push({
            severity: "error",
            message: "Previous dangerous defects found",
          });
        }
      }
    }

    // 6. Generate recommendations
    const recommendations = [];

    if (auditFlags.some((f) => f.severity === "error")) {
      recommendations.push("❌ Not recommended for purchase - critical issues found");
    } else if (auditFlags.some((f) => f.severity === "warning")) {
      recommendations.push("⚠️  Proceed with caution - issues found");
    } else {
      recommendations.push("✅ No critical issues found");
    }

    if (estimatedValue) {
      recommendations.push(
        `💷 Estimated trade value: £${estimatedValue.trade.toLocaleString()} - £${estimatedValue.retail.toLocaleString()}`
      );
    }

    return NextResponse.json({
      success: true,
      vrm: cleanVRM,
      vin,
      dvla: dvlaData,
      mot: motData,
      database: {
        make: matchedMake,
        model: matchedModel,
      },
      valuation: estimatedValue,
      audit: {
        flags: auditFlags,
        recommendations,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Vehicle check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check vehicle",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper functions

function mapDVLAFuelType(dvlaFuel: string): string {
  const fuelMap: Record<string, string> = {
    PETROL: "PETROL",
    DIESEL: "DIESEL",
    ELECTRIC: "ELECTRIC",
    "PETROL/ELECTRIC HYBRID": "HYBRID",
    "DIESEL/ELECTRIC HYBRID": "HYBRID",
    "PETROL PLUG-IN HYBRID": "PLUG_IN_HYBRID",
    "DIESEL PLUG-IN HYBRID": "PLUG_IN_HYBRID",
    LPG: "LPG",
    CNG: "CNG",
  };

  return fuelMap[dvlaFuel.toUpperCase()] || dvlaFuel;
}

function calculateEstimatedValue(
  dvlaData: any,
  motData: any
): { trade: number; retail: number; confidence: string } | null {
  // This is a simplified valuation - in production integrate with:
  // - Glass's Guide API
  // - CAP HPI
  // - Auto Trader valuations

  const age = new Date().getFullYear() - (dvlaData.yearOfManufacture || 0);
  const latestMileage = motData?.[0]?.motTests?.[0]?.odometerValue || 0;

  // Very basic depreciation calculation (for demonstration only)
  let baseValue = 30000; // Assume average new car price

  // Depreciation by age (rough UK average)
  const depreciationByAge: Record<number, number> = {
    0: 0.85, // 15% first year
    1: 0.7, // 30% by year 1
    2: 0.6, // 40% by year 2
    3: 0.5, // 50% by year 3
    4: 0.45,
    5: 0.4,
    6: 0.35,
    7: 0.3,
    8: 0.25,
    9: 0.2,
    10: 0.15,
  };

  const ageFactor = depreciationByAge[Math.min(age, 10)] || 0.1;
  baseValue *= ageFactor;

  // Mileage adjustment (UK average: 10k miles/year)
  const expectedMileage = age * 10000;
  const mileageDiff = latestMileage - expectedMileage;

  if (mileageDiff > 20000) {
    baseValue *= 0.9; // High mileage
  } else if (mileageDiff < -10000) {
    baseValue *= 1.1; // Low mileage
  }

  // Trade vs retail margin (dealers typically 15-20% markup)
  const tradeValue = Math.round(baseValue * 0.85);
  const retailValue = Math.round(baseValue);

  return {
    trade: tradeValue,
    retail: retailValue,
    confidence: "LOW", // Mark as low confidence - this is a rough estimate
  };
}

function hasMileageDiscrepancy(mileageHistory: number[]): boolean {
  if (!mileageHistory || mileageHistory.length < 2) return false;

  // Check if mileage ever decreases
  for (let i = 1; i < mileageHistory.length; i++) {
    if (mileageHistory[i] < mileageHistory[i - 1]) {
      return true; // Mileage went backwards - red flag
    }
  }

  return false;
}
