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

export async function POST(request: Request) {
  // Rate limit: 10 submissions per hour per IP
  const clientId = `leads:${getClientIdentifier(request)}`;
  const { limited, retryAfter } = rateLimit(clientId, 60 * 60 * 1000, 10);

  if (limited) {
    return NextResponse.json(
      { message: "Too many submissions. Please try again later." },
      { status: 429, headers: retryAfter ? { "Retry-After": `${Math.ceil(retryAfter / 1000)}` } : undefined }
    );
  }

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
