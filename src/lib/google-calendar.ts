import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import type { CalendarEvent, PublicCalendar } from "@/content/types";
import { getICalCalendar } from "./ical";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";

/*
 * Google Calendar integration.
 *
 * The admin signs in with Google from /admin/calendar (OAuth 2.0, offline
 * access, read-only Calendar scope) and picks one calendar. Its events are
 * fetched server-side and shown on /events as a branded monthly calendar.
 *
 *   <MEDIA_STORAGE_DIR>/google-calendar.json   account email, chosen calendar,
 *                                              AES-GCM-encrypted refresh token
 *
 * Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, optional GOOGLE_REDIRECT_URI.
 */

export const CALENDAR_CACHE_TAG = "google-calendar";
/** Short-lived cookie holding the OAuth state + PKCE verifier between /connect and /callback. */
export const OAUTH_COOKIE = "nfm_google_oauth";
const CONNECTION_PATH = dataPath(STORAGE_DIR, "google-calendar.json");
const SCOPES = ["openid", "email", "https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

/** Months shown on /events: current month plus twelve ahead. */
const MONTHS_BEFORE = 0;
const MONTHS_AFTER = 12;

/** Sign-in failed because the calendar permission checkbox was left unticked. */
export class GoogleScopeMissing extends Error {}

export class GoogleReauthRequired extends Error {
  constructor() {
    super("Google access has expired or was revoked. Sign in with Google again.");
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** Must exactly match an "Authorized redirect URI" on the Google OAuth client. */
export function redirectUriFor(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/admin/google/callback`;
}

// ---------------------------------------------------------------------------
// Connection store
// ---------------------------------------------------------------------------

const storedSchema = z.object({
  email: z.string(),
  refreshToken: z.string(),
  calendarId: z.string().optional(),
  calendarName: z.string().optional(),
  connectedAt: z.string(),
});

type StoredConnection = z.infer<typeof storedSchema>;
export type GoogleConnection = Omit<StoredConnection, "refreshToken">;

/** Refresh tokens are encrypted at rest with a key derived from the OAuth client secret. */
function tokenKey(clientSecret: string) {
  return createHash("sha256").update(`nfm-google-token:${clientSecret}`).digest();
}

function encrypt(plain: string, clientSecret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(clientSecret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

function decrypt(sealed: string, clientSecret: string) {
  const [iv, tag, data] = sealed.split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(clientSecret), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

async function readStored(): Promise<StoredConnection | null> {
  try {
    return storedSchema.parse(JSON.parse(await fs.readFile(CONNECTION_PATH, "utf8")));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeStored(connection: StoredConnection) {
  await writeFileAtomic(CONNECTION_PATH, JSON.stringify(connection, null, 2) + "\n", 0o600);
}

export async function getConnection(): Promise<GoogleConnection | null> {
  const stored = await readStored();
  if (!stored) return null;
  return { email: stored.email, calendarId: stored.calendarId, calendarName: stored.calendarName, connectedAt: stored.connectedAt };
}

async function refreshTokenOf(stored: StoredConnection) {
  const config = googleConfig();
  if (!config) throw new Error("Google OAuth is not configured.");
  try {
    return decrypt(stored.refreshToken, config.clientSecret);
  } catch {
    // The client secret changed since sign-in, so the token can't be read.
    throw new GoogleReauthRequired();
  }
}

export async function setCalendar(calendarId: string, calendarName: string) {
  const stored = await readStored();
  if (!stored) throw new Error("No Google account is connected.");
  await writeStored({ ...stored, calendarId, calendarName });
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export function createPkce() {
  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export function buildAuthUrl(params: { redirectUri: string; state: string; challenge: string; loginHint?: string }) {
  const config = googleConfig();
  if (!config) throw new Error("Google OAuth is not configured.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    // Always show consent so Google issues a refresh token on every sign-in.
    prompt: "consent select_account",
    include_granted_scopes: "true",
    state: params.state,
    code_challenge: params.challenge,
    code_challenge_method: "S256",
    ...(params.loginHint ? { login_hint: params.loginHint } : {}),
  }).toString();
  return url.toString();
}

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  scope: z.string().optional(),
});

/** Exchanges an authorization code, then stores the account. Keeps the chosen calendar when the same account reconnects. */
export async function completeSignIn(code: string, verifier: string, redirectUri: string) {
  const config = googleConfig();
  if (!config) throw new Error("Google OAuth is not configured.");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      code_verifier: verifier,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token exchange failed (HTTP ${res.status}): ${await res.text()}`);
  const tokens = tokenResponseSchema.parse(await res.json());

  if (!tokens.scope?.includes("calendar.readonly")) {
    throw new GoogleScopeMissing("Calendar access wasn't granted.");
  }
  if (!tokens.refresh_token) throw new Error("Google didn't return a refresh token. Please try signing in again.");

  // The ID token comes straight from Google's token endpoint over TLS, so its
  // claims can be read without verifying the signature.
  const claims = tokens.id_token
    ? (JSON.parse(Buffer.from(tokens.id_token.split(".")[1], "base64url").toString("utf8")) as { email?: string })
    : {};
  const email = claims.email ?? "Google account";

  const previous = await readStored();
  if (previous && previous.email !== email) await revokeQuietly(previous);

  await writeStored({
    email,
    refreshToken: encrypt(tokens.refresh_token, config.clientSecret),
    calendarId: previous?.email === email ? previous.calendarId : undefined,
    calendarName: previous?.email === email ? previous.calendarName : undefined,
    connectedAt: new Date().toISOString(),
  });
  accessTokenCache = { token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
}

/** Revokes Google's grant (best effort) and forgets the account. */
export async function signOut() {
  const stored = await readStored();
  if (stored) await revokeQuietly(stored);
  await fs.rm(CONNECTION_PATH, { force: true });
  accessTokenCache = null;
}

async function revokeQuietly(stored: StoredConnection) {
  try {
    const token = await refreshTokenOf(stored);
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[google-calendar] token revocation failed", err);
  }
}

// ---------------------------------------------------------------------------
// API access
// ---------------------------------------------------------------------------

let accessTokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(stored: StoredConnection) {
  if (accessTokenCache && accessTokenCache.expiresAt - 60_000 > Date.now()) return accessTokenCache.token;
  const config = googleConfig();
  if (!config) throw new Error("Google OAuth is not configured.");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: await refreshTokenOf(stored),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (res.status === 400 || res.status === 401) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (body.error === "invalid_grant" || body.error === "unauthorized_client") throw new GoogleReauthRequired();
  }
  if (!res.ok) throw new Error(`Google token refresh failed (HTTP ${res.status}).`);
  const tokens = tokenResponseSchema.parse(await res.json());
  accessTokenCache = { token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
  return tokens.access_token;
}

async function googleGet<T>(stored: StoredConnection, path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${API}${path}`);
  url.search = new URLSearchParams(params).toString();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await getAccessToken(stored)}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    accessTokenCache = null;
    throw new GoogleReauthRequired();
  }
  if (!res.ok) throw new Error(`Google Calendar API ${path} failed (HTTP ${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export type CalendarListItem = { id: string; name: string; primary: boolean; timeZone?: string };

export async function listCalendars(): Promise<CalendarListItem[]> {
  const stored = await readStored();
  if (!stored) return [];
  const data = await googleGet<{
    items?: { id: string; summary?: string; summaryOverride?: string; primary?: boolean; timeZone?: string }[];
  }>(stored, "/users/me/calendarList", { minAccessRole: "reader", maxResults: "250" });
  return (data.items ?? [])
    .map((c) => ({ id: c.id, name: c.summaryOverride || c.summary || c.id, primary: !!c.primary, timeZone: c.timeZone }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name));
}

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  visibility?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

// ---------------------------------------------------------------------------
// Public calendar (cached)
// ---------------------------------------------------------------------------

/**
 * Events for the public /events calendar, or null when no calendar is
 * connected (or Google is unreachable — the page then falls back to the
 * static schedule). Refreshed every 5 minutes, and immediately when the admin
 * changes the connection.
 */
export async function getPublicCalendar(): Promise<PublicCalendar | null> {
  "use cache";
  cacheTag(CALENDAR_CACHE_TAG);
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 });

  if (!googleConfig()) return getICalCalendar();
  const stored = await readStored();
  if (!stored?.calendarId) return getICalCalendar();

  try {
    const now = new Date();
    // Fetch a slightly wider UTC window than needed; it's trimmed to whole months in the calendar's zone below.
    const timeMin = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - MONTHS_BEFORE - 1, 1));
    const timeMax = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + MONTHS_AFTER + 2, 1));

    const items: GoogleEvent[] = [];
    let timeZone = "UTC";
    let pageToken: string | undefined;
    for (let page = 0; page < 10; page++) {
      const data = await googleGet<{ items?: GoogleEvent[]; timeZone?: string; nextPageToken?: string }>(
        stored,
        `/calendars/${encodeURIComponent(stored.calendarId)}/events`,
        {
          singleEvents: "true",
          orderBy: "startTime",
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          maxResults: "250",
          ...(pageToken ? { pageToken } : {}),
        },
      );
      items.push(...(data.items ?? []));
      if (data.timeZone) timeZone = data.timeZone;
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    const currentMonth = monthInZone(now, timeZone);
    const rangeStart = addMonths(currentMonth, -MONTHS_BEFORE);
    const rangeEnd = addMonths(currentMonth, MONTHS_AFTER);

    const events = items.flatMap((item): CalendarEvent[] => {
      if (item.status === "cancelled" || item.visibility === "private" || item.visibility === "confidential") return [];
      const allDay = !!item.start?.date;
      const start = item.start?.date ?? item.start?.dateTime;
      const end = item.end?.date ?? item.end?.dateTime ?? start;
      if (!start || !end) return [];
      return [
        {
          id: item.id,
          title: item.summary?.trim() || "Event",
          description: item.description ? htmlToText(item.description).slice(0, 2000) || undefined : undefined,
          location: item.location?.trim() || undefined,
          allDay,
          start,
          end,
        },
      ];
    });

    return { timeZone, events, rangeStart, rangeEnd, currentMonth };
  } catch (err) {
    console.error("[google-calendar] failed to load public calendar", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function monthInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}`;
}

function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Google event descriptions may contain basic HTML; the public page renders plain text only. */
function htmlToText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
