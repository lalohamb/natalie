import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, safeEqual, verifySessionToken } from "@/lib/admin-session";
import {
  CALENDAR_CACHE_TAG,
  GoogleScopeMissing,
  OAUTH_COOKIE,
  completeSignIn,
  redirectUriFor,
} from "@/lib/google-calendar";

/** GET /api/admin/google/callback — Google redirects here after the admin signs in. */
export async function GET(request: NextRequest) {
  const back = (query: string) => {
    const response = NextResponse.redirect(new URL(`/admin/calendar?${query}`, request.url));
    response.cookies.delete({ name: OAUTH_COOKIE, path: "/api/admin/google" });
    return response;
  };

  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return back(`error=${params.get("error") === "access_denied" ? "denied" : "google"}`);

  const [expectedState, verifier] = (request.cookies.get(OAUTH_COOKIE)?.value ?? "").split(".");
  const state = params.get("state") ?? "";
  const code = params.get("code");
  if (!expectedState || !verifier || !code || !safeEqual(state, expectedState)) return back("error=state");

  try {
    await completeSignIn(code, verifier, redirectUriFor(request.nextUrl.origin));
  } catch (err) {
    if (err instanceof GoogleScopeMissing) return back("error=scope");
    console.error("[google-calendar] sign-in failed", err);
    return back("error=signin");
  }

  revalidateTag(CALENDAR_CACHE_TAG, { expire: 0 });
  return back("connected=1");
}
