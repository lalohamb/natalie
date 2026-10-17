import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { BookingCTA } from "@/components/sections/booking-cta";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBio, getPortraits, getSite } from "@/lib/content";

const site = getSite();

export const metadata: Metadata = {
  title: "About Natalie",
  description:
    "Natalie C. Flemons is a trailblazing spiritual midwife, pure Prophet of the Lord, powerful intercessor and founder of Natalie Flemons Ministries.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  const bio = getBio();
  const portraits = getPortraits();

  return (
    <>
      {/* ── A. Introduction / Hero ── */}
      <section aria-labelledby="about-heading" className="py-section">
        <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 lg:pr-6">
            <Eyebrow className="motion-safe:animate-rise">About Natalie</Eyebrow>
            <h1
              id="about-heading"
              className="mt-8 font-display text-display-xl font-medium text-balance text-espresso uppercase motion-safe:animate-rise [animation-delay:80ms]"
            >
              {site.tagline}
            </h1>
            <p className="mt-4 font-sans text-sm font-semibold text-gold-ink uppercase tracking-widest motion-safe:animate-rise [animation-delay:120ms]">
              {bio.identityLine}
            </p>
            <p className="mt-8 text-lede text-pretty text-stone motion-safe:animate-rise [animation-delay:160ms]">
              {bio.short}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 motion-safe:animate-rise [animation-delay:240ms]">
              <ButtonLink href="/events">UPCOMING EVENTS</ButtonLink>
              <ButtonLink href="/books" variant="secondary">Explore the Books</ButtonLink>
            </div>
          </div>

          <figure className="relative motion-safe:animate-fade [animation-delay:120ms] lg:col-span-5 lg:col-start-8">
            <div aria-hidden className="absolute -top-3 -left-3 h-12 w-12 border-t border-l border-gold/60" />
            <div className="relative aspect-[4/5] overflow-hidden bg-linen">
              <Image
                src={portraits.autumn.src}
                alt={portraits.autumn.alt}
                placeholder="blur"
                fetchPriority="high"
                loading="eager"
                quality={85}
                sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 100vw"
                className="h-full w-full object-cover object-[50%_20%]"
              />
            </div>
            <div aria-hidden className="absolute -right-3 -bottom-3 h-20 w-20 border-r-2 border-b-2 border-gold" />
          </figure>
        </Container>
      </section>

      {/* ── Role banner ── */}
      <div className="border-y border-sand/70 bg-linen">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 font-sans text-eyebrow font-semibold text-stone uppercase sm:justify-between">
            {bio.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
            <li className="text-gold-ink">{bio.yearsInMinistry} years in ministry</li>
          </ul>
        </Container>
      </div>

      {/* ── B. Ministry Journey ── */}
      <section aria-labelledby="journey-heading" className="py-section">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              id="journey-heading"
              eyebrow="Ministry Journey"
              title="Her calling"
              size="md"
            />
            <figure className="relative mt-12">
              <div className="relative aspect-[3/4] overflow-hidden bg-linen">
                <Image
                  src={portraits.garden.src}
                  alt={portraits.garden.alt}
                  placeholder="blur"
                  sizes="(min-width: 1280px) 380px, (min-width: 1024px) 32vw, 100vw"
                  className="h-full w-full object-cover object-[28%_30%]"
                />
              </div>
              <div aria-hidden className="absolute -right-3 -bottom-3 h-16 w-16 border-r border-b border-gold" />
            </figure>
          </Reveal>

          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <div className="flex flex-col gap-6 text-pretty text-stone">
              {bio.sections.ministryJourney.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-lede" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── C. Leadership and Service ── */}
      <section aria-labelledby="leadership-heading" className="bg-linen py-section">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              id="leadership-heading"
              eyebrow="Leadership & Service"
              title="Church ministry"
              size="md"
            />
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <div className="flex flex-col gap-6 text-pretty text-stone">
              {bio.sections.leadership.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-lede" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── D. Faith in the Marketplace ── */}
      <section aria-labelledby="marketplace-heading" className="py-section">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              id="marketplace-heading"
              eyebrow="Faith in the Marketplace"
              title="Kingdom in the workplace"
              size="md"
            />
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
            <div className="flex flex-col gap-6 text-pretty text-stone">
              {bio.sections.marketplace.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-lede" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── E. Personal Testimony ── */}
      <section aria-labelledby="testimony-heading" className="bg-espresso py-section text-ivory">
        <Container className="max-w-4xl">
          <Reveal>
            <Eyebrow tone="dark">Personal Testimony</Eyebrow>
            <h2
              id="testimony-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              The promise fulfilled
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-6 text-pretty text-mist">
            {[...bio.sections.personalTestimony, ...bio.sections.closing].map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? "text-lede" : undefined}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── F. My Story — autobiography distinction ── */}
      <section aria-labelledby="my-story-heading" className="py-section">
        <Container className="max-w-4xl">
          <Reveal>
            <Eyebrow>My Story</Eyebrow>
            <h2
              id="my-story-heading"
              className="mt-6 font-display text-display-md font-medium text-balance"
            >
              From the chaos to the call
            </h2>
            <p className="mt-5 max-w-prose text-pretty text-stone">
              Natalie&apos;s autobiography traces her personal journey from life&apos;s deepest
              challenges to the clarity of her divine calling. The complete narrative is available
              in her book.
            </p>
            {/*
              Note: The 2026 professional biography is not the complete autobiography.
              Extended personal narrative content requires separate ministry approval
              before publication. See KNOWN-GAPS.md for tracking.
            */}
            <ButtonLink
              href="/books/from-the-chaos-to-the-call"
              variant="text"
              arrow
              className="mt-6"
            >
              Read the autobiography
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      <BookingCTA />
      <NewsletterSection />
    </>
  );
}
