import { NextResponse } from "next/server";
import { z } from "zod";
import { buyingRequestSchema } from "@/lib/validation";
import { evaluateBuyingRequest } from "@/lib/services/buying";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const validated = buyingRequestSchema.parse(payload);
    const result = await evaluateBuyingRequest(validated);
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error("Buying tool failure", error);
    return NextResponse.json({ message: "Buying qualification failed" }, { status: 500 });
  }
}
