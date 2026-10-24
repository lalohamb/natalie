import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session";

/**
 * Redirects signed-out visitors away from /admin. This is a convenience layer
 * only — admin pages, Server Actions and Route Handlers each verify the
 * session themselves (see `lib/admin-auth.ts`).
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
