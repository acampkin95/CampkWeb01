import { NextResponse } from "next/server";
import { z } from "zod";
import { buyingRequestSchema } from "@/lib/validation";
import { evaluateBuyingRequest } from "@/lib/services/buying";
import { generateBuyingReport } from "@/lib/pdf/buying-report";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const validated = buyingRequestSchema.parse(payload);
    const result = await evaluateBuyingRequest(validated);
    const buffer = await generateBuyingReport(validated, result);
    const filename = `buying-${validated.vrm ?? validated.make ?? "report"}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}
