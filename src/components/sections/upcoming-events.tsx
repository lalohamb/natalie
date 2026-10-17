import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { EventCard } from "@/components/sections/event-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getHomeContent, getUpcomingEvents } from "@/lib/content";

export function UpcomingEvents() {
  const { upcomingEvents } = getHomeContent();
  const events = getUpcomingEvents(3);

  return (
    <section aria-labelledby="upcoming-events-heading" className="bg-forest py-12 text-ivory lg:py-14">
      <Container>
        {events.length > 0 ? (
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
                View the full {new Date().getFullYear() + 1} schedule →
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
