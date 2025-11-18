import { NextRequest, NextResponse } from "next/server";
import { sessionCookieName, verifySessionTokenEdge } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isCmsWrite = pathname.startsWith("/api/cms") && request.method !== "GET";
  const isMediaEndpoint = pathname.startsWith("/api/media");

  if (isAdminArea || isCmsWrite || isMediaEndpoint) {
    const token = request.cookies.get(sessionCookieName)?.value;
    const valid = await verifySessionTokenEdge(token);
    if (!valid) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/cms", "/api/media"],
};
