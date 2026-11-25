import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { EventCard } from "@/components/sections/event-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CalendarEvent } from "@/content/types";
import { getHomeContent, getUpcomingEvents } from "@/lib/content";
import { getUpcomingCalendarEvents } from "@/lib/google-calendar";

/** "March 15, 2027" or "March 15 – 17, 2027"; timed events add "7:00 PM CDT". */
function whenLabel(event: CalendarEvent, timeZone: string) {
  if (event.allDay) {
    const date = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
    const start = new Date(`${event.start}T00:00:00Z`);
    // All-day `end` is exclusive: step back a day to get the last day of the event.
    const last = new Date(new Date(`${event.end}T00:00:00Z`).getTime() - 86_400_000);
    return last > start ? date.formatRange(start, last) : date.format(start);
  }
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone }).format(new Date(event.start));
  const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone }).format(
    new Date(event.start),
  );
  return `${date} · ${time}`;
}

/** A calendar event on the homepage. Calendar events have no page of their own, so the card links to /events. */
function CalendarEventCard({ event, timeZone, index }: { event: CalendarEvent; timeZone: string; index: number }) {
  const headingId = `upcoming-event-${index}`;
  return (
    <article
      aria-labelledby={headingId}
      className="group relative flex h-full flex-col gap-4 border border-ivory/20 p-6 transition-colors duration-300 hover:border-gold/60"
    >
      <p className="font-sans text-sm font-semibold text-gold-light">{whenLabel(event, timeZone)}</p>
      <h3 id={headingId} className="font-display text-display-sm font-medium text-balance text-ivory">
        <Link href="/events" className="after:absolute after:inset-0 hover:text-gold-light">
          {event.title}
        </Link>
      </h3>
      {event.location && <p className="text-sm text-mist">{event.location}</p>}
      {event.description && <p className="line-clamp-2 text-sm text-pretty text-mist">{event.description}</p>}
    </article>
  );
}

/**
 * Homepage "Upcoming Events". Shows the next events from the public Google
 * Calendar (the same source as /events); if there is no calendar it falls back
 * to the static schedule in `src/content/events.ts`, and if both are empty to
 * an invitation to view the schedule.
 */
export async function UpcomingEvents() {
  const { upcomingEvents } = getHomeContent();
  const calendar = await getUpcomingCalendarEvents(3);
  const calendarEvents = calendar?.events ?? [];
  // Static events are only consulted when the calendar has nothing to show.
  const events = calendarEvents.length > 0 ? [] : getUpcomingEvents(3);
  const hasEvents = calendarEvents.length > 0 || events.length > 0;

  return (
    <section aria-labelledby="upcoming-events-heading" className="bg-forest py-12 text-ivory lg:py-14">
      <Container>
        {hasEvents ? (
          <>
            <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                id="upcoming-events-heading"
                eyebrow={upcomingEvents.eyebrow}
                title={upcomingEvents.heading}
                tone="dark"
              />
              <ButtonLink
                href={upcomingEvents.cta.href}
                variant="outline-inverse"
                className="shrink-0 self-start md:self-auto"
              >
                {upcomingEvents.cta.label}
              </ButtonLink>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {calendar &&
                calendarEvents.map((event, i) => (
                  <Reveal key={event.id} delay={i * 0.08} className="h-full">
                    <CalendarEventCard event={event} timeZone={calendar.timeZone} index={i} />
                  </Reveal>
                ))}
              {events.map((event, i) => (
                <Reveal key={event.id} delay={i * 0.08}>
                  <EventCard
                    event={event}
                    className="border-ivory/20 bg-forest text-ivory [&_h3]:text-ivory [&_p]:text-mist"
                  />
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10 text-center" delay={0.2}>
              <Link
                href="/events"
                className="font-sans text-sm font-semibold text-gold-light underline decoration-gold-light/40 underline-offset-4 hover:decoration-gold-light"
              >
                View the full schedule →
              </Link>
            </Reveal>
          </>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — text */}
            <Reveal>
              <p className="font-sans text-eyebrow font-semibold text-gold-light uppercase tracking-[0.22em]">
                {upcomingEvents.eyebrow}
              </p>
              <h2
                id="upcoming-events-heading"
                className="mt-6 font-display text-display-lg font-medium text-balance"
              >
                Upcoming Events
              </h2>
              <p className="mt-5 max-w-sm text-pretty text-mist">
                Be encouraged in person. Join Natalie at one of her upcoming, or special ministry events.
              </p>
              <ButtonLink href="/events" variant="outline-inverse" arrow className="mt-8">
                VIEW 2027 SCHEDULE
              </ButtonLink>
            </Reveal>

            {/* Right — decorative panel */}
            <Reveal delay={0.12}>
              <div className="relative overflow-hidden border border-ivory/20 px-8 py-12">
                <span aria-hidden className="absolute top-0 left-0 h-10 w-10 border-t border-l border-gold/50" />
                <span aria-hidden className="absolute right-0 bottom-0 h-10 w-10 border-r border-b border-gold/50" />
                <p className="font-display text-display-sm italic text-ivory/80 leading-snug text-balance">
                  &ldquo;Equipping believers to discern the voice of God, carry their mantle with integrity, and step fully into the destiny He has prepared.&rdquo;
                </p>
                <p className="mt-6 font-sans text-eyebrow font-semibold text-gold-light uppercase tracking-[0.22em]">
                  — Natalie C. Flemons
                </p>
              </div>
            </Reveal>
          </div>
        )}
      </Container>
    </section>
  );
}
