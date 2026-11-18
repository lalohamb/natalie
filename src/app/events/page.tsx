import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { MonthCalendar } from "@/components/calendar/month-calendar";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublicCalendar } from "@/lib/google-calendar";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming events for Natalie Flemons Ministries — conferences, services, workshops, and appearances.",
  alternates: { canonical: "/events" },
  openGraph: { url: "/events" },
};

async function getCurrentMonth() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86_400 });
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function EventsCalendar() {
  const [calendar, currentMonth] = await Promise.all([
    getPublicCalendar(),
    getCurrentMonth(),
  ]);

  if (!calendar) {
    return (
      <section className="py-section">
        <Container>
          <Reveal>
            <div className="rounded-sm border border-sand bg-linen px-8 py-12 text-center">
              <span aria-hidden className="mx-auto block h-px w-8 bg-gold" />
              <p className="mt-6 font-display text-display-sm font-medium text-espresso">
                The upcoming schedule is being finalised.
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
        </Container>
      </section>
    );
  }

  // Ensure the calendar starts from the current month
  const calendarWithCurrentMonth = { ...calendar, currentMonth };

  return (
    <section aria-label="Events calendar" className="pt-8 pb-section">
      <Container>
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span aria-hidden className="block h-px w-8 bg-gold" />
            <SectionHeading
              as="h1"
              id="events-heading"
              eyebrow="Upcoming Schedule"
              title="Events & Appearances"
              lede="Conferences, services, workshops, and ministry appearances."
              className="mt-4 motion-safe:animate-rise"
            />
          </div>
          <ButtonLink
            href="#invite"
            variant="secondary"
            className="shrink-0 self-start md:self-auto motion-safe:animate-rise [animation-delay:120ms]"
          >
            Invite Natalie
          </ButtonLink>
        </div>
        <div className="rounded-sm bg-linen p-4 sm:p-6">
          <MonthCalendar calendar={calendarWithCurrentMonth} />
        </div>
      </Container>
    </section>
  );
}

export default function EventsPage() {
  return (
    <>
      {/* ── Header ── */}
      <section aria-labelledby="events-heading" className="border-b border-sand">
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
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
          {/* Gradient fade to ivory at the bottom */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ivory to-transparent" />
        </div>
      </section>

      <Suspense>
        <EventsCalendar />
      </Suspense>

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
              Submit an Inquiry
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
