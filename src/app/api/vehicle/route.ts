import { NextResponse } from "next/server";
import { fetchVehicleLookup } from "@/lib/services/vehicle";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const vrm = payload?.vrm;
    const listPriceInput = payload?.listPrice;
    const listPrice =
      typeof listPriceInput === "number" && Number.isFinite(listPriceInput) && listPriceInput > 0
        ? listPriceInput
        : undefined;
    if (!vrm || typeof vrm !== "string") {
      return NextResponse.json({ message: "Registration number is required." }, { status: 400 });
    }
    const result = await fetchVehicleLookup(vrm, { listPrice });
    return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
