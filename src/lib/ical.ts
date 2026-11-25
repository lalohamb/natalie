import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { PublicCalendar } from "@/content/types";
import { CALENDAR_CACHE_TAG } from "./google-calendar";
import { parseICal } from "./ical-parser";

/**
 * Fetches a public Google Calendar iCal feed and returns a PublicCalendar.
 * No OAuth or Google Cloud project required — the calendar just needs to be
 * set to "public" in Google Calendar settings.
 *
 * Set GOOGLE_CALENDAR_ICAL_URL in .env.local to the "Public address in iCal
 * format" URL from Google Calendar → Settings → Integrate calendar.
 *
 * Returns null when no feed is configured, it can't be fetched, or the
 * response isn't an iCalendar document. A valid feed with nothing scheduled
 * returns a calendar with no events. Parsing lives in `ical-parser.ts`.
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
