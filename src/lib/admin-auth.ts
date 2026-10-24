import "server-only";

import { connection } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, createSessionToken, safeEqual, verifySessionToken } from "./admin-session";

/*
 * Admin identity model: a single shared password (ADMIN_PASSWORD) exchanged
 * for a signed, HTTP-only session cookie. Every admin page, Server Action and
 * Route Handler re-verifies the cookie; `proxy.ts` only provides the redirect.
 */

export const isAdminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected!);
}

export async function isAdmin() {
  // Session checks compare against the current time, so they must never be prerendered.
  await connection();
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Use at the top of every admin page and Server Action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax (not Strict) so the session survives the redirect back from Google sign-in.
    // Server Actions and the upload route check the request origin themselves.
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

// ---------------------------------------------------------------------------
// Login throttling — in-memory, per client IP. Good enough for a single
// server instance; resets on restart.
// ---------------------------------------------------------------------------

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

export function isLoginThrottled(ip: string, now = Date.now()) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (now - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(ip: string, now = Date.now()) {
  const entry = failures.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) failures.set(ip, { count: 1, first: now });
  else entry.count++;
}

export function clearLoginFailures(ip: string) {
  failures.delete(ip);
}
