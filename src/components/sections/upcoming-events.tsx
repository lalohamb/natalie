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

  // Omit section entirely when no events are scheduled — no empty placeholder
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="upcoming-events-heading" className="bg-forest py-section text-ivory">
      <Container>
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
      </Container>
    </section>
  );
}
