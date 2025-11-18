import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/vehicles/makes
 * Get all vehicle makes with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const search = searchParams.get("search");

    const makes = await prisma.vehicleMake.findMany({
      where: {
        AND: [
          { isActive: true },
          country ? { country } : {},
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
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        logoUrl: true,
        _count: {
          select: {
            models: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      makes,
      count: makes.length,
    });
  } catch (error) {
    console.error("Error fetching makes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicle makes" },
      { status: 500 }
    );
  }
}
