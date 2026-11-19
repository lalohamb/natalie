import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { CalendarEvent, PublicCalendar } from "@/content/types";
import { CALENDAR_CACHE_TAG } from "./google-calendar";

/**
 * Fetches a public Google Calendar iCal feed and returns a PublicCalendar.
 * No OAuth or Google Cloud project required — the calendar just needs to be
 * set to "public" in Google Calendar settings.
 *
 * Set GOOGLE_CALENDAR_ICAL_URL in .env.local to the "Public address in iCal
 * format" URL from Google Calendar → Settings → Integrate calendar.
 */
export async function getICalCalendar(): Promise<PublicCalendar | null> {
  "use cache";
  cacheTag(CALENDAR_CACHE_TAG);
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 });

  const url = process.env.GOOGLE_CALENDAR_ICAL_URL;
  if (!url) return null;

  // Restrict to Google Calendar iCal feeds only
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.error("[ical] GOOGLE_CALENDAR_ICAL_URL is not a valid URL");
    return null;
  }
  if (parsed.hostname !== "calendar.google.com") {
    console.error("[ical] GOOGLE_CALENDAR_ICAL_URL must be a calendar.google.com URL");
    return null;
  }

  try {
    const res = await fetch(parsed.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error(`[ical] fetch failed (HTTP ${String(res.status)})`);
      return null;
    }
    return parseICal(await res.text());
  } catch (err) {
    console.error("[ical] failed to load calendar", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Minimal iCal parser (RFC 5545)
// Handles folded lines, VEVENT blocks, VALUE=DATE all-day events, TZID params.
// ---------------------------------------------------------------------------

function parseICal(text: string): PublicCalendar | null {
  // Unfold continuation lines (CRLF or LF followed by whitespace)
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);

  let timeZone = "UTC";
  const tzLine = lines.find((l) => l.startsWith("X-WR-TIMEZONE:"));
  if (tzLine) timeZone = tzLine.slice("X-WR-TIMEZONE:".length).trim();

  const events: CalendarEvent[] = [];
  let inEvent = false;
  let props: Record<string, string> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      props = {};
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      const event = buildEvent(props, timeZone);
      if (event) events.push(event);
      continue;
    }
    if (!inEvent) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const fullKey = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = fullKey.split(";")[0];
    props[baseKey] = value;
    props[`${baseKey}_PARAMS`] = fullKey; // preserve params (e.g. TZID=...)
  }

  if (events.length === 0) return null;

  const now = new Date();
  const currentMonth = monthInZone(now, timeZone);
  const rangeStart = addMonths(currentMonth, 0);
  const rangeEnd = addMonths(currentMonth, 12);

  const filtered = events.filter((e) => {
    const month = (e.allDay ? e.start : new Date(e.start).toISOString()).slice(0, 7);
    return month >= rangeStart && month <= rangeEnd;
  });

  return { timeZone, events: filtered, rangeStart, rangeEnd, currentMonth };
}

function buildEvent(props: Record<string, string>, calTz: string): CalendarEvent | null {
  const uid = props["UID"];
  const dtstart = props["DTSTART"];
  if (!uid || !dtstart) return null;
  if (props["STATUS"] === "CANCELLED") return null;

  const startParams = props["DTSTART_PARAMS"] ?? "";
  const allDay = startParams.includes("VALUE=DATE") || /^\d{8}$/.test(dtstart);

  let start: string;
  let end: string;

  if (allDay) {
    start = iCalDateToYmd(dtstart);
    end = props["DTEND"] ? iCalDateToYmd(props["DTEND"]) : start;
  } else {
    start = parseDateTime(dtstart, startParams, calTz);
    end = props["DTEND"] ? parseDateTime(props["DTEND"], props["DTEND_PARAMS"] ?? "", calTz) : start;
  }

  return {
    id: uid,
    title: props["SUMMARY"] ? unescapeICal(props["SUMMARY"]).trim() || "Event" : "Event",
    description: props["DESCRIPTION"] ? unescapeICal(props["DESCRIPTION"]).slice(0, 2000) || undefined : undefined,
    location: props["LOCATION"] ? unescapeICal(props["LOCATION"]).trim() || undefined : undefined,
    allDay,
    start,
    end,
  };
}

function iCalDateToYmd(s: string) {
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function parseDateTime(value: string, params: string, calTz: string): string {
  // UTC suffix
  if (value.endsWith("Z")) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
  }
  const tzMatch = params.match(/TZID=([^;:]+)/i);
  const tz = tzMatch ? tzMatch[1] : calTz;
  const localIso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}`;
  return zonedToUtc(localIso, tz);
}

/** Convert a local datetime string to UTC ISO using Intl (no external deps). */
function zonedToUtc(localIso: string, timeZone: string): string {
  try {
    const assumed = new Date(`${localIso}Z`);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).formatToParts(assumed);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
    const localStr = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`;
    const offset = assumed.getTime() - new Date(localStr).getTime();
    return new Date(new Date(`${localIso}Z`).getTime() + offset).toISOString();
  } catch {
    return `${localIso}Z`;
  }
}

function unescapeICal(s: string) {
  // 1. iCal escape sequences
  const ical = s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
  // 2. Decode HTML entities first so tag stripping works correctly
  const decoded = ical
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
  // 3. Convert block-level HTML to newlines, extract hrefs, strip remaining tags
  return decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, "$2 $1")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function monthInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}`;
}

function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
