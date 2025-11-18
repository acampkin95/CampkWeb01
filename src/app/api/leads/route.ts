import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addLead, listLeads } from "@/lib/leadStore";
import { leadSchema } from "@/lib/validation";
import { sessionCookieName } from "@/lib/auth-shared";
import { rateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS, HTTP_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

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
    return NextResponse.json({ message: "Unauthorized" }, { status: HTTP_STATUS.UNAUTHORIZED });
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
  // Rate limit based on configured values
  const clientId = `leads:${getClientIdentifier(request)}`;
  const { limited, retryAfter } = rateLimit(
    clientId,
    RATE_LIMITS.LEADS.WINDOW_MS,
    RATE_LIMITS.LEADS.MAX_ATTEMPTS
  );

  if (limited) {
    return NextResponse.json(
      { message: "Too many submissions. Please try again later." },
      {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: retryAfter ? { "Retry-After": `${Math.ceil(retryAfter / 1000)}` } : undefined
      }
    );
  }

  try {
    const payload = await request.json();
    const parsed = leadSchema.parse(payload);
    const lead = await addLead(parsed);
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    logger.error("Lead submission failed", {
      error: error instanceof Error ? error.message : String(error),
      clientId: getClientIdentifier(request),
    });
    return NextResponse.json({ message: "Invalid lead", details: `${error}` }, { status: HTTP_STATUS.BAD_REQUEST });
  }
}
