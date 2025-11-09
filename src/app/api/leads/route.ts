import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addLead, listLeads } from "@/lib/leadStore";
import { leadSchema } from "@/lib/validation";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("campkin_admin");
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const leads = await listLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = leadSchema.parse(payload);
    const lead = await addLead(parsed);
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ message: "Invalid lead", details: `${error}` }, { status: 400 });
  }
}
