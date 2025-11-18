import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * POST /api/vehicles/create
 * Create a new vehicle in the database
 */

const CreateVehicleSchema = z.object({
  title: z.string().min(1),
  makeId: z.string(),
  modelId: z.string(),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 2),
  vrm: z.string().optional(),
  mileage: z.number().int().min(0),
  price: z.number().int().min(0),
  fuel: z.enum(["PETROL", "DIESEL", "HYBRID", "PLUG_IN_HYBRID", "ELECTRIC", "MILD_HYBRID", "LPG", "CNG"]),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC", "CVT", "DCT"]),
  body: z.string().min(1),
  colour: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  features: z.array(z.string()).default([]),
  status: z.enum(["IN_PREP", "IN_STOCK", "RESERVED", "SOLD"]).default("IN_PREP"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = CreateVehicleSchema.parse(body);

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        title: validatedData.title,
        makeId: validatedData.makeId,
        modelId: validatedData.modelId,
        year: validatedData.year,
        vrm: validatedData.vrm,
        mileage: validatedData.mileage,
        price: validatedData.price,
        fuel: validatedData.fuel,
        transmission: validatedData.transmission,
        body: validatedData.body,
        colour: validatedData.colour,
        description: validatedData.description || "",
        images: validatedData.images,
        features: validatedData.features,
        status: validatedData.status,
      },
      include: {
        make: true,
        model: true,
      },
    });

    return NextResponse.json({
      success: true,
      vehicle,
      message: "Vehicle created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid vehicle data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create vehicle",
      },
      { status: 500 }
    );
  }
}
