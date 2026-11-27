import type { Metadata } from "next";
import Image from "next/image";
import { AboutTabs } from "@/components/sections/about-tabs";
import { BookingCTA } from "@/components/sections/booking-cta";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/seo/json-ld";
import { getBio, getPortraits, getSite } from "@/lib/content";
import { readAbout } from "@/lib/about-store";
import { personStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About Natalie",
  description:
    "Natalie C. Flemons is a trailblazing spiritual midwife, pure Prophet of the Lord, powerful intercessor and founder of Natalie Flemons Ministries.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default async function AboutPage() {
  const bio = getBio();
  const portraits = getPortraits();
  const site = getSite();
  const about = await readAbout();

  const tabs = about.tabs
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((t) => ({ id: t.id, label: t.label, paragraphs: t.paragraphs as readonly string[] }));

  const portraitSrc = about.portraitUrl ?? portraits.autumn.src;
  const portraitAlt = about.portraitAlt ?? portraits.autumn.alt;

  return (
    <>
      <JsonLd data={personStructuredData()} />

      {/* ── Hero: heading + tabs left, portrait right ── */}
      <section aria-labelledby="about-heading" className="relative overflow-hidden bg-linen">
        <div className="grid lg:grid-cols-12 lg:items-stretch">

          {/* Left — text + tabs */}
          <div className="relative z-10 flex flex-col justify-center px-gutter py-4 lg:col-span-6 lg:py-1 xl:col-span-5">
            <div aria-hidden className="absolute inset-0 bg-linen/95 lg:bg-transparent" />
            <div className="relative flex flex-col gap-6">
              <Eyebrow className="motion-safe:animate-rise">About Natalie</Eyebrow>
              <h1
                id="about-heading"
                className="font-display text-display-lg font-medium text-espresso uppercase leading-[0.95] tracking-[-0.015em] motion-safe:animate-rise [animation-delay:80ms]"
              >
                {site.tagline}
              </h1>
              <p className="font-sans text-sm font-semibold text-gold-ink uppercase tracking-widest motion-safe:animate-rise [animation-delay:120ms]">
                {bio.identityLine}
              </p>

              {/* Tabbed bio */}
              <div className="motion-safe:animate-rise [animation-delay:200ms]">
                <AboutTabs tabs={tabs} />
              </div>
            </div>
          </div>

          {/* Right — portrait */}
          <figure
            className="relative order-first aspect-[4/3] overflow-hidden lg:order-last lg:col-span-6 lg:aspect-auto lg:self-stretch xl:col-span-7"
            aria-label={portraitAlt}
          >
            <div className="grain-overlay absolute inset-0 motion-safe:[animation:portrait-enter_1100ms_var(--ease-editorial)_both]">
              <Image
                src={portraitSrc}
                alt={portraitAlt}
                {...(typeof portraitSrc === "string" ? {} : { placeholder: "blur" })}
                fetchPriority="high"
                loading="eager"
                quality={90}
                fill
                sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_18%]"
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-24 hidden bg-gradient-to-r from-linen to-transparent lg:block"
            />
            <div aria-hidden className="absolute right-4 bottom-4 h-16 w-16 border-r border-b border-gold/60 sm:right-6 sm:bottom-6 sm:h-20 sm:w-20" />
            <figcaption className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <div className="rounded-sm px-1 py-1 bg-espresso/70 backdrop-blur-md">
                <span className="block font-display text-4xl font-bold text-ivory [text-shadow:0_4px_16px_rgba(0,0,0,0.8)]">{bio.name}</span>
                <span className="block font-sans text-lg font-extrabold text-gold-light uppercase tracking-[0.22em] mt-1 [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">Founder</span>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Ember CTA strip ── */}
      <div className="bg-ember">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-5">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 font-sans text-eyebrow font-semibold text-ivory uppercase">
              {bio.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
              <li className="text-ivory">{bio.yearsInMinistry} years in ministry</li>
            </ul>
            <ButtonLink href="/books/from-the-chaos-to-the-call" variant="inverse" arrow>
              Read Full Story
            </ButtonLink>
          </div>
        </Container>
      </div>

      <BookingCTA />
    </>
  );
}
