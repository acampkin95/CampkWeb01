import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addLead, listLeads } from "@/lib/leadStore";
import { leadSchema } from "@/lib/validation";
import { sessionCookieName } from "@/lib/auth-shared";
import { rateLimit } from "@/lib/rateLimit";

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    return firstIp ? firstIp.trim() : "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName);
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

function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: Request) {
  // Rate limit: 5 submissions per 10 minutes per IP
  const clientId = `lead:${getClientIdentifier(request)}`;
  const { limited, retryAfter } = rateLimit(clientId, LEAD_RATE_LIMIT_WINDOW_MS, 5);
  if (limited) {
    return NextResponse.json(
      { message: "Too many submissions. Please wait before trying again." },
      { status: 429, headers: retryAfter ? { "Retry-After": `${Math.ceil(retryAfter / 1000)}` } : undefined },
    );
  }

  try {
    const payload = await request.json();
    const parsed = leadSchema.parse(payload);
    const lead = await addLead(parsed);
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lead submission failed", error);
    const details = process.env.NODE_ENV === "production" ? undefined : `${error}`;
    return NextResponse.json({ message: "Invalid lead", ...(details && { details }) }, { status: 400 });
  }
}
