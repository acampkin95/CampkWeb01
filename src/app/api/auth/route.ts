import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieName, sessionMaxAge, verifyPasscode } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { ADMIN_RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

const RATE_LIMIT_MAX = Number(process.env.ADMIN_RATE_LIMIT ?? "10");
const RATE_LIMIT_WINDOW_MS = Number(process.env.ADMIN_RATE_WINDOW_MS ?? ADMIN_RATE_LIMIT_WINDOW_MS);

function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "local";
}

export async function POST(request: Request) {
  const clientId = `auth:${getClientIdentifier(request)}`;
  const { limited, retryAfter } = rateLimit(clientId, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX);
  if (limited) {
    return NextResponse.json(
      { message: "Too many attempts. Please wait before retrying." },
      { status: 429, headers: retryAfter ? { "Retry-After": `${Math.ceil(retryAfter / 1000)}` } : undefined },
    );
  }

  try {
    const { passcode } = await request.json();

    if (!passcode || !verifyPasscode(passcode)) {
      return NextResponse.json({ message: "Incorrect passcode" }, { status: 401 });
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
  } catch (error) {
    console.error("Auth request failed", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
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
