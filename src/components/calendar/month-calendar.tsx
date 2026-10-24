"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, MapPin, X } from "lucide-react";
import type { CalendarEvent, PublicCalendar } from "@/content/types";
import { cn } from "@/lib/cn";

/*
 * Branded monthly calendar for Google Calendar events. All dates are shown in
 * the calendar's own time zone, so every visitor sees the same schedule.
 * Desktop shows event chips inside each day; mobile shows dots and an agenda
 * list for the selected day (or the whole month).
 */

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MAX_CHIPS = 3;

// ── Date helpers ("YYYY-MM-DD" / "YYYY-MM" strings, UTC-based arithmetic) ──

const ymdParts = (ymd: string) => ymd.split("-").map(Number);
const utcDate = (ymd: string) => {
  const [y, m, d = 1] = ymdParts(ymd);
  return new Date(Date.UTC(y, m - 1, d));
};
const toYmd = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (ymd: string, n: number) => {
  const d = utcDate(ymd);
  d.setUTCDate(d.getUTCDate() + n);
  return toYmd(d);
};
const addMonths = (month: string, n: number) => {
  const [y, m] = ymdParts(month);
  return toYmd(new Date(Date.UTC(y, m - 1 + n, 1))).slice(0, 7);
};

function ymdInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Every calendar day an event touches, in the calendar's zone. */
function eventDays(event: CalendarEvent, timeZone: string) {
  let first: string;
  let last: string;
  if (event.allDay) {
    first = event.start;
    last = addDays(event.end, -1); // all-day end dates are exclusive
  } else {
    const start = new Date(event.start);
    const end = new Date(event.end);
    first = ymdInZone(start, timeZone);
    // An event ending exactly at midnight doesn't occupy the next day.
    last = ymdInZone(new Date(Math.max(start.getTime(), end.getTime() - 1)), timeZone);
  }
  const days: string[] = [];
  for (let day = first, i = 0; day <= last && i < 62; day = addDays(day, 1), i++) days.push(day);
  return days.length ? days : [first];
}

// ── Formatting ──

const monthTitle = (month: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(utcDate(month));

const longDay = (ymd: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(
    utcDate(ymd),
  );

function timeOf(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(new Date(iso))
    .replace(":00", "");
}

function whenLabel(event: CalendarEvent, timeZone: string) {
  if (event.allDay) {
    const lastDay = addDays(event.end, -1);
    const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });
    return lastDay > event.start
      ? fmt.formatRange(utcDate(event.start), utcDate(lastDay))
      : `${fmt.format(utcDate(event.start))} · All day`;
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone }).formatRange(
    new Date(event.start),
    new Date(event.end),
  );
}

/** Short label for a chip on a given day. */
function chipTime(event: CalendarEvent, day: string, timeZone: string) {
  if (event.allDay) return null;
  return ymdInZone(new Date(event.start), timeZone) === day ? timeOf(event.start, timeZone) : "cont.";
}

function googleCalendarLink(event: CalendarEvent, timeZone: string) {
  const compact = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dates = event.allDay
    ? `${event.start.replace(/-/g, "")}/${event.end.replace(/-/g, "")}`
    : `${compact(event.start)}/${compact(event.end)}`;
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates, ctz: timeZone });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);
  return `https://calendar.google.com/calendar/render?${params}`;
}

// ── "Today", read on the client only so server and client markup match ──

const noopSubscribe = () => () => {};

function useToday(timeZone: string) {
  return useSyncExternalStore(
    noopSubscribe,
    () => ymdInZone(new Date(), timeZone),
    () => null,
  );
}

// ---------------------------------------------------------------------------

export function MonthCalendar({ calendar }: { calendar: PublicCalendar }) {
  const { timeZone, rangeStart, rangeEnd } = calendar;
  const today = useToday(timeZone);
  const [month, setMonth] = useState(calendar.currentMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<CalendarEvent | null>(null);
  /** Day whose full event list is open (from "+N more"). */
  const [openDay, setOpenDay] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of calendar.events) {
      for (const day of eventDays(event, timeZone)) {
        const list = map.get(day) ?? [];
        list.push(event);
        map.set(day, list);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.localeCompare(b.start));
    }
    return map;
  }, [calendar.events, timeZone]);

  // Grid: whole weeks covering the month.
  const firstOfMonth = `${month}-01`;
  const offset = utcDate(firstOfMonth).getUTCDay();
  const daysInMonth = new Date(Date.UTC(ymdParts(month)[0], ymdParts(month)[1], 0)).getUTCDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const gridStart = addDays(firstOfMonth, -offset);
  const rows = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  );

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => addDays(firstOfMonth, i));
  const monthEventCount = new Set(monthDays.flatMap((day) => (byDay.get(day) ?? []).map((e) => e.id))).size;

  const goTo = (next: string) => {
    setMonth(next);
    setSelectedDay(null);
  };
  const canPrev = month > rangeStart;
  const canNext = month < rangeEnd;
  const todayMonth = (today ?? calendar.currentMonth).slice(0, 7);

  const openDetails = (event: CalendarEvent) => {
    setOpenEvent(event);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  };
  const openDayList = (day: string) => {
    setOpenEvent(null);
    setOpenDay(day);
    dialogRef.current?.showModal();
  };

  const zoneName =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" })
      .formatToParts(new Date(`${month}-15T12:00:00Z`))
      .find((p) => p.type === "timeZoneName")?.value ?? timeZone;

  // Mobile agenda: selected day, or every day of the month with events.
  const agendaDays = (selectedDay ? [selectedDay] : monthDays).filter((day) => byDay.has(day));

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-5">
        <div>
          <h2 aria-live="polite" className="font-display text-display-md font-medium text-espresso">
            {monthTitle(month)}
          </h2>
          <p className="mt-1 font-sans text-xs text-stone">
            {monthEventCount === 0
              ? "No events scheduled"
              : `${monthEventCount} event${monthEventCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(todayMonth)}
            disabled={month === todayMonth}
            className="min-h-10 rounded-sm border border-espresso/30 px-4 font-sans text-xs font-semibold tracking-[0.06em] text-espresso uppercase transition-colors hover:bg-espresso hover:text-ivory disabled:pointer-events-none disabled:opacity-40"
          >
            Today
          </button>
          <NavButton label="Previous month" disabled={!canPrev} onClick={() => goTo(addMonths(month, -1))}>
            <ChevronLeft aria-hidden className="size-5" strokeWidth={1.75} />
          </NavButton>
          <NavButton label="Next month" disabled={!canNext} onClick={() => goTo(addMonths(month, 1))}>
            <ChevronRight aria-hidden className="size-5" strokeWidth={1.75} />
          </NavButton>
        </div>
      </div>

      {/* ── Month grid ── */}
      <table className="mt-6 w-full table-fixed border-collapse">
        <caption className="sr-only">
          {monthTitle(month)} events calendar. Times shown in {zoneName}.
        </caption>
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th
                key={day}
                scope="col"
                abbr={day}
                className="pb-3 text-center font-sans text-[0.6875rem] font-semibold tracking-[0.14em] text-gold-ink uppercase"
              >
                <span className="sm:hidden">{day.slice(0, 1)}</span>
                <span className="hidden sm:inline">{day.slice(0, 3)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((week) => (
            <tr key={week[0]}>
              {week.map((day) => {
                const inMonth = day.startsWith(month);
                const events = byDay.get(day) ?? [];
                const isToday = day === today;
                const isSelected = day === selectedDay;
                const dayNumber = ymdParts(day)[2];
                return (
                  <td
                    key={day}
                    className={cn(
                      "h-14 border border-sand p-0 align-top sm:h-32",
                      inMonth ? "bg-ivory" : "bg-linen/60",
                    )}
                  >
                    {/* Mobile: whole cell selects the day */}
                    <button
                      type="button"
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      aria-pressed={isSelected}
                      aria-label={`${longDay(day)}${events.length ? `, ${events.length} event${events.length === 1 ? "" : "s"}` : ""}`}
                      className={cn(
                        "flex h-full w-full flex-col items-center gap-1 pt-1.5 sm:hidden",
                        isSelected && "bg-espresso/5 ring-2 ring-inset ring-gold",
                      )}
                    >
                      <DayNumber value={dayNumber} today={isToday} muted={!inMonth} />
                      {events.length > 0 && (
                        <span aria-hidden className="flex gap-0.5">
                          {events.slice(0, 3).map((e) => (
                            <span key={e.id} className={cn("size-1.5 rounded-full", e.allDay ? "bg-forest" : "bg-ember")} />
                          ))}
                        </span>
                      )}
                    </button>

                    {/* Desktop: chips */}
                    <div className="hidden h-full flex-col gap-1 p-1.5 sm:flex">
                      <DayNumber value={dayNumber} today={isToday} muted={!inMonth} />
                      {events.slice(0, MAX_CHIPS).map((event) => {
                        const time = chipTime(event, day, timeZone);
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => openDetails(event)}
                            title={event.title}
                            className={cn(
                              "w-full truncate rounded-[2px] px-1.5 py-1 text-left font-sans text-[0.6875rem] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold",
                              event.allDay
                                ? "bg-forest text-ivory hover:bg-forest/85"
                                : "border-l-2 border-ember bg-ember/10 text-espresso hover:bg-ember/20",
                              !inMonth && "opacity-60",
                            )}
                          >
                            {time && <span className="font-semibold tabular-nums">{time} </span>}
                            {event.title}
                          </button>
                        );
                      })}
                      {events.length > MAX_CHIPS && (
                        <button
                          type="button"
                          onClick={() => openDayList(day)}
                          className="px-1.5 text-left font-sans text-[0.6875rem] font-semibold text-gold-ink hover:text-ember"
                        >
                          +{events.length - MAX_CHIPS} more
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 font-sans text-xs text-stone">Times shown in {zoneName}.</p>

      {/* ── Mobile agenda ── */}
      <div className="mt-8 sm:hidden">
        <h3 className="font-sans text-eyebrow font-semibold tracking-[0.14em] text-gold-ink uppercase">
          {selectedDay ? longDay(selectedDay) : `All of ${monthTitle(month)}`}
        </h3>
        {agendaDays.length === 0 ? (
          <p className="mt-3 text-sm text-stone italic">No events {selectedDay ? "on this day" : "this month"}.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-sand border-y border-sand">
            {agendaDays.flatMap((day) =>
              (byDay.get(day) ?? []).map((event) => (
                <li key={`${day}-${event.id}`}>
                  <button
                    type="button"
                    onClick={() => openDetails(event)}
                    className="flex w-full items-start gap-4 py-4 text-left"
                  >
                    <span className="w-12 shrink-0 text-center">
                      <span className="block font-sans text-[0.625rem] font-semibold tracking-[0.12em] text-gold-ink uppercase">
                        {new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(utcDate(day))}
                      </span>
                      <span className="block font-display text-2xl leading-none text-espresso">{ymdParts(day)[2]}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-snug text-espresso">{event.title}</span>
                      <span className="mt-0.5 block font-sans text-xs text-stone">
                        {chipTime(event, day, timeZone) ?? "All day"}
                        {event.location && ` · ${event.location}`}
                      </span>
                    </span>
                  </button>
                </li>
              )),
            )}
          </ul>
        )}
      </div>

      {/* ── Event details ── */}
      <dialog
        ref={dialogRef}
        onClose={() => {
          setOpenEvent(null);
          setOpenDay(null);
        }}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-labelledby={openEvent ? "calendar-event-title" : "calendar-day-title"}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-sm bg-ivory p-0 text-espresso shadow-2xl backdrop:bg-espresso/60 backdrop:backdrop-blur-sm"
      >
        {!openEvent && openDay && (
          <div className="relative p-7">
            <CloseButton onClick={() => dialogRef.current?.close()} />
            <span aria-hidden className="block h-px w-8 bg-gold" />
            <h3 id="calendar-day-title" className="mt-4 pr-8 font-display text-display-sm font-medium">
              {longDay(openDay)}
            </h3>
            <ul className="mt-5 flex flex-col divide-y divide-sand border-y border-sand">
              {(byDay.get(openDay) ?? []).map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => openDetails(event)}
                    className="flex w-full items-baseline gap-3 py-3 text-left hover:text-ember"
                  >
                    <span className="w-16 shrink-0 font-sans text-xs font-semibold text-gold-ink tabular-nums">
                      {chipTime(event, openDay, timeZone) ?? "All day"}
                    </span>
                    <span className="font-display text-lg leading-snug">{event.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {openEvent && (
          <div className="relative p-7">
            <CloseButton onClick={() => dialogRef.current?.close()} />
            {openDay && (
              <button
                type="button"
                onClick={() => setOpenEvent(null)}
                className="mb-4 inline-flex items-center gap-1 font-sans text-xs font-semibold text-gold-ink hover:text-ember"
              >
                <ChevronLeft aria-hidden className="size-4" strokeWidth={1.75} />
                {longDay(openDay)}
              </button>
            )}

            <span aria-hidden className="block h-px w-8 bg-gold" />
            <h3 id="calendar-event-title" className="mt-4 pr-8 font-display text-display-sm font-medium text-balance">
              {openEvent.title}
            </h3>

            <dl className="mt-5 flex flex-col gap-3 font-sans text-sm">
              <div className="flex gap-3">
                <dt className="sr-only">When</dt>
                <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" strokeWidth={1.75} />
                <dd>
                  {whenLabel(openEvent, timeZone)}
                  {!openEvent.allDay && <span className="block text-xs text-stone">{zoneName}</span>}
                </dd>
              </div>
              {openEvent.location && (
                <div className="flex gap-3">
                  <dt className="sr-only">Where</dt>
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-ink" strokeWidth={1.75} />
                  <dd>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openEvent.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-gold underline-offset-4 hover:text-ember"
                    >
                      {openEvent.location}
                      <span className="sr-only"> (opens map in a new tab)</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {openEvent.description && (
              <p className="mt-5 max-h-60 overflow-y-auto border-t border-sand pt-5 text-sm whitespace-pre-line text-pretty text-stone">
                {openEvent.description}
              </p>
            )}

            <a
              href={googleCalendarLink(openEvent, timeZone)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex min-h-11 items-center gap-2.5 rounded-sm bg-ember px-6 font-sans text-xs font-semibold tracking-[0.06em] text-ivory uppercase transition-colors hover:bg-ember-deep"
            >
              <CalendarPlus aria-hidden className="size-4" strokeWidth={1.75} />
              Add to Google Calendar
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </dialog>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-sm text-stone hover:bg-linen hover:text-espresso"
    >
      <X aria-hidden className="size-5" strokeWidth={1.75} />
    </button>
  );
}

function DayNumber({ value, today, muted }: { value: number; today: boolean; muted: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-full font-sans text-xs font-semibold tabular-nums",
        today ? "bg-ember text-ivory" : muted ? "text-stone/60" : "text-espresso",
      )}
    >
      {value}
      {today && <span className="sr-only"> (today)</span>}
    </span>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-sm border border-espresso/30 text-espresso transition-colors hover:bg-espresso hover:text-ivory disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
