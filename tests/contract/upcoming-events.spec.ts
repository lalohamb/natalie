import { test, expect } from "playwright/test";
import type { CalendarEvent, PublicCalendar } from "@/content/types";
import { upcomingEvents } from "@/lib/google-calendar";

/**
 * Which calendar events the homepage shows as "upcoming" (docs/KNOWN-GAPS.md G-40).
 * Calendar zone: America/Chicago. "Now" is 10 March 2027, 3 pm Central.
 */

const NOW = new Date("2027-03-10T20:00:00Z");

const event = (id: string, start: string, end: string, allDay = false): CalendarEvent => ({ id, title: id, allDay, start, end });

const calendar = (events: CalendarEvent[]): PublicCalendar => ({
  timeZone: "America/Chicago",
  events,
  rangeStart: "2027-03",
  rangeEnd: "2028-03",
  currentMonth: "2027-03",
});

const ids = (events: CalendarEvent[], limit = 10) => upcomingEvents(calendar(events), NOW, limit).map((e) => e.id);

test.describe("upcoming events for the homepage", () => {
  test("finished events are left out; one still under way is kept", () => {
    expect(
      ids([
        event("ended-an-hour-ago", "2027-03-10T17:00:00Z", "2027-03-10T19:00:00Z"),
        event("under-way", "2027-03-10T19:30:00Z", "2027-03-10T21:00:00Z"),
        event("tomorrow", "2027-03-11T23:00:00Z", "2027-03-12T01:00:00Z"),
      ]),
    ).toEqual(["under-way", "tomorrow"]);
  });

  test("all-day events: today counts, yesterday does not, multi-day spans count until they end", () => {
    expect(
      ids([
        event("yesterday", "2027-03-09", "2027-03-10", true),
        event("today", "2027-03-10", "2027-03-11", true),
        event("conference-ending-today", "2027-03-08", "2027-03-11", true),
        event("same-day-end", "2027-03-10", "2027-03-10", true),
      ]).sort(),
    ).toEqual(["conference-ending-today", "same-day-end", "today"]);
  });

  test("\"today\" is the calendar's day, not UTC's", () => {
    // 11 pm Central on the 10th is already the 11th in UTC.
    const lateEvening = new Date("2027-03-11T05:00:00Z");
    const result = upcomingEvents(calendar([event("the-10th", "2027-03-10", "2027-03-11", true)]), lateEvening, 10);
    expect(result.map((e) => e.id)).toEqual(["the-10th"]);
  });

  test("soonest first across all-day and timed events, limited to the number asked for", () => {
    expect(
      ids(
        [
          event("april-timed", "2027-04-02T00:00:00Z", "2027-04-02T02:00:00Z"),
          event("march-20-evening", "2027-03-21T00:00:00Z", "2027-03-21T02:00:00Z"),
          event("march-20-all-day", "2027-03-20", "2027-03-21", true),
          event("march-15", "2027-03-15", "2027-03-16", true),
        ],
        3,
      ),
    ).toEqual(["march-15", "march-20-all-day", "march-20-evening"]);
  });

  test("an empty calendar has nothing upcoming", () => {
    expect(ids([])).toEqual([]);
  });
});
