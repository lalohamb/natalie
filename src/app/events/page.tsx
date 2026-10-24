import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MonthCalendar } from "@/components/calendar/month-calendar";
import { Reveal } from "@/components/motion/reveal";
import { EventCard } from "@/components/sections/event-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEventsByMonth } from "@/lib/content";
import { getPublicCalendar } from "@/lib/google-calendar";

export const metadata: Metadata = {
  title: "Events",
  description:
    "The 2027 events schedule for Natalie Flemons Ministries — conferences, services, workshops, and appearances.",
  alternates: { canonical: "/events" },
  openGraph: { url: "/events" },
};

const YEAR = 2027;

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
] as const;

export default async function EventsPage() {
  // Google Calendar (connected from /admin/calendar) is the live schedule when available.
  const calendar = await getPublicCalendar();

  const monthData = MONTHS.map((name, i) => ({
    name,
    month: i + 1,
    events: getEventsByMonth(YEAR, i + 1),
  }));

  const totalEvents = monthData.reduce((sum, m) => sum + m.events.length, 0);

  return (
    <>
      {/* ── Header ── */}
      <section aria-labelledby="events-heading" className="border-b border-sand">
        {/* Image */}
        <div className="relative aspect-[16/7] w-full overflow-hidden">
          <Image
            src="/Open Bible Overlooking Golden Cityscape.png"
            alt="Open Bible Overlooking Golden Cityscape"
            fill
            fetchPriority="high"
            loading="eager"
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        {/* Text below image */}
        <div className="bg-linen py-10">
          <Container className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              as="h1"
              id="events-heading"
              eyebrow={`${YEAR} Schedule`}
              title="Events & Appearances"
              lede="Conferences, services, workshops, and ministry appearances."
              className="motion-safe:animate-rise"
            />
            <ButtonLink href="#invite" variant="secondary" className="shrink-0 self-start md:self-auto motion-safe:animate-rise [animation-delay:120ms]">
              Invite Natalie
            </ButtonLink>
          </Container>
        </div>
      </section>

      {calendar ? (
        <section aria-label="Events calendar" className="py-section">
          <Container>
            <MonthCalendar calendar={calendar} />
          </Container>
        </section>
      ) : (
        <>
        {/* ── Month navigation ── */}
        <nav aria-label="Jump to month" className="sticky top-20 z-30 border-b border-sand bg-ivory/95 backdrop-blur-sm">
          <Container>
            <ul className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
              {monthData.map(({ name, month, events }) => (
                <li key={month} className="shrink-0">
                  <Link
                    href={`#month-${month}`}
                    className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 font-sans text-[0.8125rem] font-semibold text-stone transition-colors hover:bg-linen hover:text-espresso"
                  >
                    {name.slice(0, 3)}
                    {events.length > 0 && (
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-ember text-[0.625rem] font-bold text-ivory">
                        {events.length}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>

        {/* ── Schedule ── */}
        <section aria-label={`${YEAR} full schedule`} className="py-section">
          <Container>
            {totalEvents === 0 && (
              <Reveal>
                <div className="mb-16 rounded-sm border border-sand bg-linen px-8 py-10 text-center">
                  <p className="font-display text-display-sm font-medium text-espresso">
                    The {YEAR} schedule is being finalised.
                  </p>
                  <p className="mt-3 text-stone">
                    Check back soon, or{" "}
                    <Link href="#invite" className="text-ember underline underline-offset-4 hover:decoration-2">
                      invite Natalie to your event
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>
            )}

            <div className="flex flex-col gap-16">
              {monthData.map(({ name, month, events }, i) => (
                <div key={month} id={`month-${month}`} className="scroll-mt-32">
                  <Reveal delay={Math.min(i * 0.04, 0.2)}>
                    {/* Month header */}
                    <div className="mb-6 flex items-baseline gap-6 border-b border-sand pb-4">
                      <h2 className="font-display text-display-md font-medium text-espresso">
                        {name}
                      </h2>
                      <span className="font-sans text-eyebrow text-stone">
                        {events.length === 0
                          ? "No events scheduled"
                          : `${events.length} event${events.length > 1 ? "s" : ""}`}
                      </span>
                    </div>

                    {/* Events grid or empty state */}
                    {events.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-sm text-stone italic">
                        No events confirmed for {name} {YEAR}.
                      </p>
                    )}
                  </Reveal>
                </div>
              ))}
            </div>
          </Container>
        </section>
        </>
      )}

      {/* ── Invite Natalie ── */}
      <section
        id="invite"
        aria-labelledby="invite-heading"
        className="scroll-mt-24 bg-forest py-section text-ivory"
      >
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Reveal className="lg:col-span-7">
            <Eyebrow tone="dark">Speaking &amp; Ministry</Eyebrow>
            <h2
              id="invite-heading"
              className="mt-6 font-display text-display-xl font-medium uppercase"
            >
              Invite Natalie
            </h2>
            <p className="mt-8 max-w-xl text-lede text-pretty text-mist">
              Natalie is a sought-after speaker, spiritual advisor and builder of God&apos;s Kingdom.
              Churches, ministries, organizations and event coordinators are invited to share the
              details of their gathering.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <ul className="border-t border-ivory/20">
              {["Churches", "Ministries", "Organizations", "Event coordinators"].map((audience) => (
                <li
                  key={audience}
                  className="border-b border-ivory/20 py-3.5 font-display text-xl text-ivory italic"
                >
                  {audience}
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact" variant="inverse" arrow className="mt-10 w-full sm:w-auto">
              VIEW 2027 SCHEDULE
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
