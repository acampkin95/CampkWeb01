import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vehicles/configurations
 * Get vehicle configurations with detailed specs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");
    const fuel = searchParams.get("fuel");
    const transmission = searchParams.get("transmission");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");

    const configurations = await prisma.vehicleConfiguration.findMany({
      where: {
        AND: [
          { isActive: true },
          modelId ? { modelId } : {},
          fuel ? { fuel: fuel as any } : {},
          transmission ? { transmission: transmission as any } : {},
          minYear ? { yearStart: { gte: parseInt(minYear) } } : {},
          maxYear
            ? {
                OR: [
                  { yearEnd: { lte: parseInt(maxYear) } },
                  { yearEnd: null },
                ],
              }
            : {},
        ],
      },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
      orderBy: [{ yearStart: "desc" }, { trim: "asc" }],
    });

    return NextResponse.json({
      success: true,
      configurations,
      count: configurations.length,
    });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch configurations" },
      { status: 500 }
    );
  }
}
