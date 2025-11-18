import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vehicles/models
 * Get vehicle models with filtering by make, body type, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const makeId = searchParams.get("makeId");
    const makeSlug = searchParams.get("makeSlug");
    const bodyType = searchParams.get("bodyType");
    const segment = searchParams.get("segment");
    const search = searchParams.get("search");
    const includeConfigs = searchParams.get("includeConfigs") === "true";

    const models = await prisma.vehicleModel.findMany({
      where: {
        AND: [
          { isActive: true },
          makeId ? { makeId } : {},
          makeSlug ? { make: { slug: makeSlug } } : {},
          bodyType ? { bodyType } : {},
          segment ? { segment } : {},
          search
            ? {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              }
            : {},
        ],
      },
      include: {
        make: true,
        configurations: includeConfigs
          ? {
              where: { isActive: true },
              take: 10,
            }
          : false,
        _count: {
          select: {
            configurations: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ make: { displayOrder: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      models,
      count: models.length,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle models" },
      { status: 500 }
    );
  }
}
