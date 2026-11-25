/*
 * Stateless admin session tokens: `<expiresAtMs>.<base64url HMAC-SHA256>`.
 *
 * Uses Web Crypto only (no `node:` imports, no `next/headers`) so the same
 * verification runs in `proxy.ts` and on the server.
 */

export const ADMIN_COOKIE = "nfm_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();

let warnedAboutFallback = false;

/**
 * Sessions are signed with ADMIN_SESSION_SECRET, falling back to ADMIN_PASSWORD.
 * The fallback keeps a fresh install working, but production should set a
 * separate random secret: rotating it signs every admin out without changing
 * the password, and a leaked session token then says nothing about the password.
 */
function signingSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  const password = process.env.ADMIN_PASSWORD || "";
  if (password && process.env.NODE_ENV === "production" && !warnedAboutFallback) {
    warnedAboutFallback = true;
    console.warn("[admin] ADMIN_SESSION_SECRET is not set; admin sessions are signed with ADMIN_PASSWORD. Set a separate random secret.");
  }
  return password;
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(`nfm-admin:${payload}`)));
}

/** Constant-time comparison of two strings. */
export function safeEqual(a: string, b: string) {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()) {
  const secret = signingSecret();
  if (!secret) throw new Error("Admin access is not configured (ADMIN_PASSWORD is unset).");
  const expires = String(now + SESSION_TTL_SECONDS * 1000);
  return `${expires}.${await sign(expires, secret)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()) {
  const secret = signingSecret();
  if (!token || !secret) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < now) return false;
  return safeEqual(signature, await sign(expires, secret));
}
