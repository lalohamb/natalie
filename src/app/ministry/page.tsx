import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { BookingCTA } from "@/components/sections/booking-cta";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBio, getHomeContent, getMinistryIdentity } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ministry",
  description:
    "Equipping believers to discern the voice of God. Restoring integrity in how they live, lead, and carry their calling. Activating them to walk fully in their purpose and advance the Kingdom of God.",
  alternates: { canonical: "/ministry" },
  openGraph: { url: "/ministry" },
};

export default function MinistryPage() {
  const identity = getMinistryIdentity();
  const { message } = getHomeContent();
  const bio = getBio();

  return (
    <>
      {/* ── Section 1: Ministry Introduction ── */}
      <section aria-labelledby="ministry-heading" className="bg-espresso py-section text-ivory">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 motion-safe:animate-rise">
            <p className="font-sans text-eyebrow font-semibold text-gold-light uppercase tracking-[0.22em]">
              The Ministry
            </p>
            <h1
              id="ministry-heading"
              className="mt-8 font-display text-display-xl font-medium uppercase [animation-delay:80ms]"
            >
              Equipping. Restoring. Activating.
            </h1>
            <p className="mt-8 max-w-xl text-lede text-pretty text-mist [animation-delay:160ms]">
              {identity.statement}
            </p>
          </div>
          <div className="flex items-end lg:col-span-4 lg:col-start-9 motion-safe:animate-rise [animation-delay:200ms]">
            <p className="font-display text-2xl text-ivory italic leading-snug">
              &ldquo;Three Core Values. One Kingdom Mission.&rdquo;
            </p>
          </div>
        </Container>
      </section>

      {/* ── Section 2: Three Core Values ── */}
      <section aria-labelledby="pillars-heading" className="py-section">
        <Container>
          <Reveal>
            <SectionHeading
              id="pillars-heading"
              eyebrow="Our Three Core Values"
              title="Equip · Restore · Activate"
            />
          </Reveal>

          <ol className="mt-16 grid gap-0 border-t border-sand md:grid-cols-3">
            {identity.pillars.map((pillar, index) => (
              <li
                key={pillar.id}
                className="border-b border-sand py-12 md:border-b-0 md:px-10 md:py-16 md:not-first:border-l md:first:pl-0 md:last:pr-0"
              >
                <Reveal delay={index * 0.1}>
                  <p aria-hidden className="font-sans text-eyebrow font-semibold text-gold-ink">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 font-display text-display-md font-medium uppercase">
                    {pillar.name}
                  </h2>
                  <p className="mt-3 font-display text-display-sm italic text-stone">
                    {pillar.tagline}
                  </p>
                  <p className="mt-6 text-pretty text-stone leading-relaxed">
                    {pillar.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Section 3: Ministry in Practice (Prayer, Prophecy, Purpose) ── */}
      <section aria-labelledby="practice-heading" className="bg-linen py-section">
        <Container>
          <Reveal>
            <SectionHeading
              id="practice-heading"
              eyebrow="Ministry in Practice"
              title={message.heading}
              lede={message.lede}
            />
          </Reveal>

          <ol className="mt-16 grid gap-0 border-t border-sand md:grid-cols-3">
            {message.pillars.map((pillar, index) => (
              <li
                key={pillar.title}
                className="border-b border-sand py-12 md:border-b-0 md:px-10 md:py-16 md:not-first:border-l md:first:pl-0 md:last:pr-0"
              >
                <Reveal delay={index * 0.1}>
                  <p aria-hidden className="font-sans text-eyebrow font-semibold text-gold-ink">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-display text-display-md font-medium italic">
                    {pillar.title}
                  </h3>
                  <p className="mt-6 text-pretty text-stone leading-relaxed">{pillar.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Section 4: Ministry Journey ── */}
      <section aria-labelledby="journey-heading" className="bg-espresso py-section text-ivory">
        <Container className="max-w-4xl">
          <Reveal>
            <Eyebrow tone="dark">Ministry Journey</Eyebrow>
            <h2
              id="journey-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              From Joliet to the Nations
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-6 text-pretty text-mist">
            {bio.sections.ministryJourney.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? "text-lede" : undefined}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Section 5: Ministry Engagement ── */}
      <section aria-labelledby="engagement-heading" className="bg-forest py-section text-ivory">
        <Container className="max-w-4xl text-center">
          <Reveal>
            <SectionHeading
              id="engagement-heading"
              eyebrow="Ministry Engagement"
              title="Invite Natalie to Speak"
              lede="Natalie is available for conferences, workshops, church services, and ministry events. Share the details of your gathering and let's explore how this ministry can serve your community."
              tone="dark"
              align="center"
            />
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ButtonLink href="/events">View Upcoming Events</ButtonLink>
              <ButtonLink href="/contact" variant="outline-inverse">Submit an Inquiry</ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <BookingCTA />
      <NewsletterSection />
    </>
  );
}
