import { NextResponse } from "next/server";
import type { BuyingRequest } from "@/types/buying";
import { evaluateBuyingRequest } from "@/lib/services/buying";
import { generateBuyingReport } from "@/lib/pdf/buying-report";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BuyingRequest;
    const result = await evaluateBuyingRequest(payload);
    const buffer = await generateBuyingReport(payload, result);
    const filename = `buying-${payload.vrm ?? payload.make ?? "report"}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}
