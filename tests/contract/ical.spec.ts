import { test, expect } from "playwright/test";
import { parseICal } from "@/lib/ical-parser";
import { fixtureText } from "./helpers";

/**
 * Google Calendar public iCal feed → PublicCalendar.
 * `now` is fixed so the visible window is January 2027 – January 2028.
 */

const NOW = new Date("2027-01-10T12:00:00Z");

function load() {
  const calendar = parseICal(fixtureText("ical/sample-feed.ics"), NOW);
  if (!calendar) throw new Error("fixture did not parse");
  return calendar;
}

const byTitle = (title: string) => load().events.filter((e) => e.title === title);

test.describe("iCal feed parser", () => {
  test("calendar zone and visible window", () => {
    const calendar = load();
    expect(calendar.timeZone).toBe("America/Chicago");
    expect(calendar.currentMonth).toBe("2027-01");
    expect(calendar.rangeStart).toBe("2027-01");
    expect(calendar.rangeEnd).toBe("2028-01");
  });

  test("all-day event keeps its dates and unescapes text", () => {
    const [event] = byTitle("Prayer Summit");
    expect(event).toMatchObject({ allDay: true, start: "2027-03-15", end: "2027-03-16", location: "Dallas, TX" });
  });

  test("TZID time is converted to the correct UTC instant", () => {
    const [event] = byTitle("Evening Service");
    // 7 pm Central Daylight Time (UTC−5)
    expect(event).toMatchObject({ allDay: false, start: "2027-04-11T00:00:00.000Z", end: "2027-04-11T02:00:00.000Z" });
  });

  test("UTC time is kept as-is", () => {
    const [event] = byTitle("Online Teaching");
    expect(event).toMatchObject({ start: "2027-05-01T15:00:00.000Z", end: "2027-05-01T16:30:00.000Z" });
  });

  test("cancelled and out-of-window events are dropped", () => {
    expect(byTitle("Cancelled Gathering")).toHaveLength(0);
    expect(byTitle("Last Year")).toHaveLength(0);
  });

  test("folded lines are joined and HTML becomes plain text", () => {
    const [event] = byTitle("Women of Destiny Conference");
    expect(event.description).toBe(
      "Join us & be encouraged.\nRegister https://example.org/register\nDoors open at 6; seating is limited.",
    );
    expect(event.description).not.toMatch(/[<>]/);
  });

  test("weekly rule: COUNT, EXDATE and an edited instance", () => {
    // Four Tuesdays from 2 Feb; the 9th is excluded and the 16th was moved.
    const regular = byTitle("Bible Study");
    expect(regular.map((e) => e.start)).toEqual(["2027-02-03T00:00:00.000Z", "2027-02-24T00:00:00.000Z"]);
    expect(regular[0].end).toBe("2027-02-03T01:30:00.000Z");

    const [moved] = byTitle("Bible Study (moved)");
    expect(moved.start).toBe("2027-02-18T01:00:00.000Z");

    // Every instance needs its own id — the calendar uses it as a React key.
    const ids = [...regular, moved].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("monthly rule: second Sunday until a date", () => {
    expect(byTitle("Second Sunday Prayer").map((e) => e.start)).toEqual([
      "2027-01-10",
      "2027-02-14",
      "2027-03-14",
      "2027-04-11",
    ]);
  });

  test("a recurring event keeps its local time across a daylight-saving change", () => {
    // 10 am Central: UTC−6 on 7 March, UTC−5 on 14 March.
    expect(byTitle("Sunday Morning").map((e) => e.start)).toEqual([
      "2027-03-07T16:00:00.000Z",
      "2027-03-14T15:00:00.000Z",
    ]);
  });

  test("a rule the parser does not model shows only the first occurrence", () => {
    const events = byTitle("First Monday Call");
    expect(events).toHaveLength(1);
    expect(events[0].start).toBe("2027-07-05T14:00:00.000Z");
  });

  test("events are sorted by start", () => {
    const starts = load().events.map((e) => e.start);
    expect(starts).toEqual([...starts].sort((a, b) => a.localeCompare(b)));
  });

  test("a valid feed with no events is an empty calendar, not a failure", () => {
    const calendar = parseICal("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nX-WR-TIMEZONE:America/Chicago\r\nEND:VCALENDAR\r\n", NOW);
    expect(calendar).not.toBeNull();
    expect(calendar!.events).toEqual([]);
  });

  test("a response that is not an iCalendar document is rejected", () => {
    expect(parseICal("<!doctype html><title>Sign in</title>", NOW)).toBeNull();
  });
});
