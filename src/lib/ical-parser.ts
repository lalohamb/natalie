import type { CalendarEvent, PublicCalendar } from "@/content/types";

/*
 * Minimal iCalendar (RFC 5545) reader for a public Google Calendar feed.
 *
 * Pure — no I/O and no framework imports — so it can be tested directly.
 *
 * Handles: folded lines, all-day (VALUE=DATE) and timed events, TZID / UTC /
 * floating times, cancelled events, and recurring events:
 *   RRULE with FREQ=DAILY | WEEKLY | MONTHLY | YEARLY, plus INTERVAL, COUNT,
 *   UNTIL, WKST, BYDAY (weekly lists; monthly "2SU" / "-1FR" ordinals) and
 *   BYMONTHDAY (monthly); EXDATE exclusions; RECURRENCE-ID overrides.
 *
 * A rule using any other part (BYSETPOS, BYMONTH, BYHOUR, sub-daily FREQ, …)
 * is not guessed at: only the event's first occurrence is shown.
 */

/** Months shown on /events: the current month plus twelve ahead. */
const MONTHS_AFTER = 12;
/** Upper bound on occurrences walked per recurring event (a daily event over ~27 years). */
const MAX_OCCURRENCES = 10_000;

type RawEvent = {
  props: Record<string, { value: string; params: string }>;
  exdates: { value: string; params: string }[];
};

/** A wall-clock moment with no zone attached, stored as if it were UTC. */
type Floating = number;

const DAY_MS = 86_400_000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export function parseICal(text: string, now = new Date()): PublicCalendar | null {
  if (!/BEGIN:VCALENDAR/i.test(text)) return null;

  // Unfold continuation lines (CRLF or LF followed by a space or tab).
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);

  let timeZone = "UTC";
  const tzLine = lines.find((l) => l.startsWith("X-WR-TIMEZONE:"));
  if (tzLine) timeZone = tzLine.slice("X-WR-TIMEZONE:".length).trim() || "UTC";
  if (!isValidTimeZone(timeZone)) timeZone = "UTC";

  const raws: RawEvent[] = [];
  let current: RawEvent | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = { props: {}, exdates: [] };
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) raws.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const semi = head.indexOf(";");
    const name = (semi === -1 ? head : head.slice(0, semi)).toUpperCase();
    const params = semi === -1 ? "" : head.slice(semi + 1);
    if (name === "EXDATE") current.exdates.push({ value, params });
    else current.props[name] = { value, params };
  }

  const currentMonth = monthInZone(now, timeZone);
  const rangeStart = currentMonth;
  const rangeEnd = addMonths(currentMonth, MONTHS_AFTER);
  // Occurrences are generated up to the end of the last visible month (plus a day of zone slack).
  const [endYear, endMonth] = rangeEnd.split("-").map(Number);
  const horizon: Floating = Date.UTC(endYear, endMonth, 2);

  // Instances that were individually edited: the master event must not also emit them.
  const overridden = new Map<string, Set<string>>();
  for (const raw of raws) {
    const uid = raw.props["UID"]?.value;
    const recurrenceId = raw.props["RECURRENCE-ID"];
    if (!uid || !recurrenceId) continue;
    const key = startKey(recurrenceId.value, recurrenceId.params, timeZone);
    if (!overridden.has(uid)) overridden.set(uid, new Set());
    overridden.get(uid)!.add(key);
  }

  const events: CalendarEvent[] = [];
  for (const raw of raws) events.push(...buildEvents(raw, timeZone, horizon, overridden));

  const visible = events
    .filter((e) => {
      const month = e.allDay ? e.start.slice(0, 7) : monthInZone(new Date(e.start), timeZone);
      return month >= rangeStart && month <= rangeEnd;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  return { timeZone, events: visible, rangeStart, rangeEnd, currentMonth };
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function buildEvents(
  raw: RawEvent,
  calTz: string,
  horizon: Floating,
  overridden: Map<string, Set<string>>,
): CalendarEvent[] {
  const uid = raw.props["UID"]?.value;
  const dtstart = raw.props["DTSTART"];
  if (!uid || !dtstart) return [];
  if (raw.props["STATUS"]?.value.toUpperCase() === "CANCELLED") return [];

  const allDay = isDateValue(dtstart.value, dtstart.params);
  const zone = allDay ? "UTC" : zoneOf(dtstart.value, dtstart.params, calTz);
  const start = toFloating(dtstart.value);
  if (Number.isNaN(start)) return [];

  const dtend = raw.props["DTEND"];
  let duration = 0;
  if (dtend) {
    const endFloating = toFloating(dtend.value);
    if (!Number.isNaN(endFloating)) {
      // Compare real instants so a DTEND in another zone still gives the right length.
      duration = allDay
        ? endFloating - start
        : floatingToUtcMs(endFloating, zoneOf(dtend.value, dtend.params, calTz)) - floatingToUtcMs(start, zone);
    }
  }
  if (duration < 0) duration = 0;

  const base = {
    title: unescapeICal(raw.props["SUMMARY"]?.value ?? "").trim() || "Event",
    description: raw.props["DESCRIPTION"] ? unescapeICal(raw.props["DESCRIPTION"].value).slice(0, 2000) || undefined : undefined,
    location: raw.props["LOCATION"] ? unescapeICal(raw.props["LOCATION"].value).trim() || undefined : undefined,
    allDay,
  };

  const format = (occurrence: Floating) => {
    if (allDay) {
      return { start: ymd(occurrence), end: ymd(occurrence + duration) };
    }
    const startMs = floatingToUtcMs(occurrence, zone);
    return { start: new Date(startMs).toISOString(), end: new Date(startMs + duration).toISOString() };
  };

  const isOverride = !!raw.props["RECURRENCE-ID"];
  const rule = isOverride ? null : parseRule(raw.props["RRULE"]?.value);

  // Single event, an edited instance, or a rule this parser doesn't model.
  if (!rule) {
    const times = format(start);
    return [{ id: isOverride ? `${uid}:${times.start}` : uid, ...base, ...times }];
  }

  const excluded = new Set<string>(overridden.get(uid) ?? []);
  for (const ex of raw.exdates) {
    for (const value of ex.value.split(",")) {
      if (value.trim()) excluded.add(startKey(value.trim(), ex.params, calTz));
    }
  }

  const out: CalendarEvent[] = [];
  for (const occurrence of occurrences(start, rule, horizon, (o) => (allDay ? o : floatingToUtcMs(o, zone)))) {
    const times = format(occurrence);
    if (excluded.has(times.start)) continue;
    out.push({ id: `${uid}:${times.start}`, ...base, ...times });
  }
  return out;
}

/** The same string `format()` produces for an occurrence's start — used to match EXDATE / RECURRENCE-ID. */
function startKey(value: string, params: string, calTz: string) {
  const floating = toFloating(value);
  if (isDateValue(value, params)) return ymd(floating);
  return new Date(floatingToUtcMs(floating, zoneOf(value, params, calTz))).toISOString();
}

// ---------------------------------------------------------------------------
// Recurrence
// ---------------------------------------------------------------------------

type Rule = {
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  count?: number;
  /** UTC ms for timed events; floating ms (end of that day) for date-only UNTIL. */
  until?: { ms: number; dateOnly: boolean };
  wkst: number;
  byDay: { weekday: number; ordinal: number }[];
  byMonthDay: number[];
};

function parseRule(value: string | undefined): Rule | null {
  if (!value) return null;
  const parts = new Map<string, string>();
  for (const part of value.split(";")) {
    const [key, val] = part.split("=");
    if (key && val !== undefined) parts.set(key.toUpperCase(), val.toUpperCase());
  }

  const freq = parts.get("FREQ");
  if (freq !== "DAILY" && freq !== "WEEKLY" && freq !== "MONTHLY" && freq !== "YEARLY") return null;

  const supported = new Set(["FREQ", "INTERVAL", "COUNT", "UNTIL", "WKST", "BYDAY", "BYMONTHDAY"]);
  for (const key of parts.keys()) if (!supported.has(key)) return null;

  const interval = Number(parts.get("INTERVAL") ?? "1");
  if (!Number.isInteger(interval) || interval < 1) return null;

  const byDay: Rule["byDay"] = [];
  for (const token of (parts.get("BYDAY") ?? "").split(",").filter(Boolean)) {
    const match = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(token);
    if (!match) return null;
    byDay.push({ weekday: WEEKDAYS.indexOf(match[2] as (typeof WEEKDAYS)[number]), ordinal: match[1] ? Number(match[1]) : 0 });
  }
  const byMonthDay = (parts.get("BYMONTHDAY") ?? "").split(",").filter(Boolean).map(Number);
  if (byMonthDay.some((d) => !Number.isInteger(d) || d === 0 || Math.abs(d) > 31)) return null;

  // Combinations this parser does not model.
  if (freq === "DAILY" && (byDay.length || byMonthDay.length)) return null;
  if (freq === "WEEKLY" && (byMonthDay.length || byDay.some((d) => d.ordinal !== 0))) return null;
  if (freq === "MONTHLY" && byDay.length && byMonthDay.length) return null;
  if (freq === "MONTHLY" && byDay.some((d) => d.ordinal === 0)) return null;
  if (freq === "YEARLY" && (byDay.length || byMonthDay.length)) return null;

  let until: Rule["until"];
  const rawUntil = parts.get("UNTIL");
  if (rawUntil) {
    const floating = toFloating(rawUntil);
    if (Number.isNaN(floating)) return null;
    until = /^\d{8}$/.test(rawUntil)
      ? { ms: floating + DAY_MS - 1, dateOnly: true }
      : { ms: floating, dateOnly: false }; // RFC 5545: a timed UNTIL is in UTC
  }

  let count: number | undefined;
  if (parts.has("COUNT")) {
    count = Number(parts.get("COUNT"));
    if (!Number.isInteger(count) || count < 1) return null;
  }

  const wkst = WEEKDAYS.indexOf((parts.get("WKST") ?? "MO") as (typeof WEEKDAYS)[number]);
  return { freq, interval, count, until, wkst: wkst < 0 ? 1 : wkst, byDay, byMonthDay };
}

/** Occurrence start times (floating), in order, from DTSTART up to the horizon. */
function* occurrences(start: Floating, rule: Rule, horizon: Floating, toInstant: (o: Floating) => number): Generator<Floating> {
  let emitted = 0;
  let walked = 0;

  for (const candidate of candidates(start, rule)) {
    if (++walked > MAX_OCCURRENCES) return;
    if (candidate < start) continue;
    if (candidate > horizon) return;
    if (rule.until) {
      const comparable = rule.until.dateOnly ? candidate : toInstant(candidate);
      if (comparable > rule.until.ms) return;
    }
    yield candidate;
    if (rule.count !== undefined && ++emitted >= rule.count) return;
  }
}

function* candidates(start: Floating, rule: Rule): Generator<Floating> {
  const d = new Date(start);
  const timeOfDay = start - Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  if (rule.freq === "DAILY") {
    for (let i = 0; ; i++) yield start + i * rule.interval * DAY_MS;
  }

  if (rule.freq === "WEEKLY") {
    const days = rule.byDay.length ? rule.byDay.map((b) => b.weekday) : [d.getUTCDay()];
    // Offsets from the week's first day (WKST), in order.
    const offsets = [...new Set(days.map((day) => (day - rule.wkst + 7) % 7))].sort((a, b) => a - b);
    const weekStart = start - timeOfDay - ((d.getUTCDay() - rule.wkst + 7) % 7) * DAY_MS;
    for (let week = 0; ; week++) {
      for (const offset of offsets) yield weekStart + (week * rule.interval * 7 + offset) * DAY_MS + timeOfDay;
    }
  }

  if (rule.freq === "MONTHLY") {
    for (let i = 0; ; i++) {
      const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i * rule.interval, 1));
      const year = first.getUTCFullYear();
      const month = first.getUTCMonth();
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

      let monthDays: number[];
      if (rule.byDay.length) {
        monthDays = rule.byDay.map(({ weekday, ordinal }) => {
          if (ordinal > 0) {
            const firstMatch = 1 + ((weekday - first.getUTCDay() + 7) % 7);
            return firstMatch + (ordinal - 1) * 7;
          }
          const lastWeekday = new Date(Date.UTC(year, month, daysInMonth)).getUTCDay();
          const lastMatch = daysInMonth - ((lastWeekday - weekday + 7) % 7);
          return lastMatch + (ordinal + 1) * 7;
        });
      } else if (rule.byMonthDay.length) {
        monthDays = rule.byMonthDay.map((day) => (day > 0 ? day : daysInMonth + day + 1));
      } else {
        monthDays = [d.getUTCDate()];
      }

      // Months that lack the day (e.g. the 31st, or a fifth Sunday) are skipped, as RFC 5545 requires.
      for (const day of [...new Set(monthDays)].sort((a, b) => a - b)) {
        if (day >= 1 && day <= daysInMonth) yield Date.UTC(year, month, day) + timeOfDay;
      }
    }
  }

  // YEARLY — same month and day; 29 February only occurs in leap years.
  for (let i = 0; ; i++) {
    const year = d.getUTCFullYear() + i * rule.interval;
    const candidate = new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()));
    if (candidate.getUTCMonth() === d.getUTCMonth()) yield candidate.getTime() + timeOfDay;
  }
}

// ---------------------------------------------------------------------------
// Dates and zones
// ---------------------------------------------------------------------------

function isDateValue(value: string, params: string) {
  return /VALUE=DATE(?!-)/i.test(params) || /^\d{8}$/.test(value);
}

/** `20270315` or `20270315T100000[Z]` → wall-clock time stored as UTC ms. NaN when malformed. */
function toFloating(value: string): Floating {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?Z?)?$/.exec(value.trim());
  if (!match) return NaN;
  const [, y, mo, da, h = "0", mi = "0", s = "0"] = match;
  return Date.UTC(Number(y), Number(mo) - 1, Number(da), Number(h), Number(mi), Number(s));
}

function zoneOf(value: string, params: string, calTz: string) {
  if (value.trim().endsWith("Z")) return "UTC";
  const tzid = /TZID=([^;:]+)/i.exec(params)?.[1]?.replace(/^"|"$/g, "");
  return tzid && isValidTimeZone(tzid) ? tzid : calTz;
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Converts a wall-clock time in `timeZone` to the real UTC instant (no external dependencies). */
function floatingToUtcMs(floating: Floating, timeZone: string): number {
  if (timeZone === "UTC") return floating;
  const offsetAt = (instant: number) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - instant;
  };
  // Two passes: the second corrects the guess when it lands on the other side of a DST change.
  const guess = floating - offsetAt(floating);
  return floating - offsetAt(guess);
}

function ymd(floating: Floating) {
  return new Date(floating).toISOString().slice(0, 10);
}

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

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** iCal text → plain text. Google puts basic HTML in descriptions; the public page renders text only. */
function unescapeICal(s: string) {
  const ical = s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
  // Decode entities first so tag stripping sees real tags.
  const decoded = ical
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
  return decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, "$2 $1")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
