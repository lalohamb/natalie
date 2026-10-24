import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";
import { OAUTH_COOKIE, buildAuthUrl, createPkce, getConnection, googleConfig, redirectUriFor } from "@/lib/google-calendar";

/** GET /api/admin/google/connect — starts "Sign in with Google" for the calendar integration. */
export async function GET(request: NextRequest) {
  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (!googleConfig()) {
    return NextResponse.redirect(new URL("/admin/calendar?error=not-configured", request.url));
  }

  const { state, verifier, challenge } = createPkce();
  const switchAccount = request.nextUrl.searchParams.get("switch") === "1";
  const current = switchAccount ? null : await getConnection();
  const url = buildAuthUrl({
    redirectUri: redirectUriFor(request.nextUrl.origin),
    state,
    challenge,
    loginHint: current?.email.includes("@") ? current.email : undefined,
  });

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, `${state}.${verifier}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax so the cookie survives Google's top-level redirect back to the callback.
    sameSite: "lax",
    path: "/api/admin/google",
    maxAge: 600,
  });
  return response;
}
