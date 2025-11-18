import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieName, sessionMaxAge, verifyPasscode } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS, HTTP_STATUS } from "@/lib/constants";

const RATE_LIMIT_MAX = Number(process.env.ADMIN_RATE_LIMIT ?? RATE_LIMITS.AUTH.MAX_ATTEMPTS);
const RATE_LIMIT_WINDOW_MS = Number(process.env.ADMIN_RATE_WINDOW_MS ?? RATE_LIMITS.AUTH.WINDOW_MS);

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    return firstIp ? firstIp.trim() : "local";
  }
  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: Request) {
  const clientId = `auth:${getClientIdentifier(request)}`;
  const { limited, retryAfter } = rateLimit(clientId, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX);
  if (limited) {
    return NextResponse.json(
      { message: "Too many attempts. Please wait before retrying." },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers: retryAfter ? { "Retry-After": `${Math.ceil(retryAfter / 1000)}` } : undefined },
    );
  }

  const { passcode } = await request.json();

  if (!passcode || !verifyPasscode(passcode)) {
    return NextResponse.json({ message: "Incorrect passcode" }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: sessionCookieName,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAge,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: sessionCookieName,
    value: "",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
