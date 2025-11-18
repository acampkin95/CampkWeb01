import { NextResponse } from "next/server";
import { z } from "zod";
import { buyingRequestSchema } from "@/lib/validation";
import { evaluateBuyingRequest } from "@/lib/services/buying";
import { HTTP_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const validated = buyingRequestSchema.parse(payload);
    const result = await evaluateBuyingRequest(validated);
    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: HTTP_STATUS.BAD_REQUEST });
    }
    logger.error("Buying tool failure", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ message: "Buying qualification failed" }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
