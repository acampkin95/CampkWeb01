import { NextResponse } from "next/server";
import type { BuyingRequest } from "@/types/buying";
import { evaluateBuyingRequest } from "@/lib/services/buying";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BuyingRequest;
    const result = await evaluateBuyingRequest(payload);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Buying tool failure", error);
    return NextResponse.json({ message: "Buying qualification failed" }, { status: 500 });
  }
}
