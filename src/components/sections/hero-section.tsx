import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getBio, getHomeContent, getPortraits } from "@/lib/content";

/**
 * Cinematic hero — M3 corrected, M3-I accessibility fix.
 *
 * Layout: full-bleed portrait right column, editorial type left.
 * Portrait: single entrance (opacity + translateX), grain overlay, stationary final state.
 * Headline: word-by-word staggered rise via `.word-clip` utility.
 *   The visual spans are aria-hidden; aria-label on h1 provides the correct accessible name.
 * All motion disabled under `prefers-reduced-motion`.
 */
export function HeroSection() {
  const { hero } = getHomeContent();
  const portrait = getPortraits().autumn;
  const bio = getBio();
  const [lineOne, lineTwo, emphasis] = hero.headline;

  // Split each headline line into words for staggered animation.
  // Base delay offsets ensure lines feel sequential, not simultaneous.
  const wordsOne = lineOne.split(" ");
  const wordsTwo = lineTwo.split(" ");
  const wordsEmphasis = emphasis.split(" ");

  const baseDelays = {
    eyebrow: 0,
    lineOne: 80,
    lineTwo: 80 + wordsOne.length * 60,
    emphasis: 80 + (wordsOne.length + wordsTwo.length) * 60,
    supporting: 80 + (wordsOne.length + wordsTwo.length + wordsEmphasis.length) * 60 + 40,
    ctas: 80 + (wordsOne.length + wordsTwo.length + wordsEmphasis.length) * 60 + 160,
  };

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-ivory">
      {/* ── Two-column grid: type left, portrait right ── */}
      <div className="grid min-h-[80svh] lg:grid-cols-12 lg:min-h-[85svh]">

        {/* Left — editorial type column */}
        <div className="relative z-10 flex flex-col justify-center px-gutter py-10 lg:col-span-7 lg:py-14 xl:col-span-6">

          {/* Subtle linen wash behind text on mobile where portrait bleeds through */}
          <div aria-hidden className="absolute inset-0 bg-ivory/95 lg:bg-transparent" />

          <div className="relative">
            <Eyebrow
              className="motion-safe:animate-rise"
              style={{ animationDelay: `${baseDelays.eyebrow}ms` }}
            >
              {hero.eyebrow}
            </Eyebrow>

            {/*
              aria-label provides the correct accessible name as a single string.
              The visual child spans are aria-hidden so screen readers don't read
              the concatenated-without-spaces text that block spans produce.
            */}
            <h1
              id="hero-heading"
              aria-label={`${lineOne} ${lineTwo} ${emphasis}`}
              className="mt-6 font-display text-display-lg font-medium text-espresso uppercase leading-[0.95] tracking-[-0.015em]"
            >
              {/* Line 1 — word-by-word */}
              <span aria-hidden className="block">
                {wordsOne.map((word, i) => (
                  <span key={i} className="word-clip motion-safe:inline-block motion-safe:overflow-hidden motion-safe:align-bottom">
                    <span
                      className="motion-safe:inline-block motion-safe:[animation:word-rise_700ms_var(--ease-editorial)_both]"
                      style={{ animationDelay: `${baseDelays.lineOne + i * 60}ms` }}
                    >
                      {word}
                    </span>
                    {i < wordsOne.length - 1 && "\u00a0"}
                  </span>
                ))}
              </span>

              {/* Line 2 */}
              <span aria-hidden className="block">
                {wordsTwo.map((word, i) => (
                  <span key={i} className="word-clip motion-safe:inline-block motion-safe:overflow-hidden motion-safe:align-bottom">
                    <span
                      className="motion-safe:inline-block motion-safe:[animation:word-rise_700ms_var(--ease-editorial)_both]"
                      style={{ animationDelay: `${baseDelays.lineTwo + i * 60}ms` }}
                    >
                      {word}
                    </span>
                    {i < wordsTwo.length - 1 && "\u00a0"}
                  </span>
                ))}
              </span>

              {/* Emphasis line — italic ember */}
              <span aria-hidden className="block text-ember normal-case italic pb-[0.15em]">
                {wordsEmphasis.map((word, i) => (
                  <span key={i} className="word-clip motion-safe:inline-block motion-safe:overflow-visible motion-safe:align-bottom">
                    <span
                      className="motion-safe:inline-block motion-safe:[animation:word-rise_700ms_var(--ease-editorial)_both]"
                      style={{ animationDelay: `${baseDelays.emphasis + i * 60}ms` }}
                    >
                      {word}
                    </span>
                    {i < wordsEmphasis.length - 1 && "\u00a0"}
                  </span>
                ))}
              </span>
            </h1>

            <p
              className="mt-6 max-w-md font-display text-[1.4rem] leading-snug text-balance text-stone italic motion-safe:animate-rise sm:text-[1.6rem]"
              style={{ animationDelay: `${baseDelays.supporting}ms` }}
            >
              {hero.supporting}
            </p>

            <div
              className="mt-8 flex flex-row flex-wrap items-center gap-3 motion-safe:animate-rise"
              style={{ animationDelay: `${baseDelays.ctas}ms` }}
            >
              <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </ButtonLink>
              <ButtonLink href={hero.tertiaryCta.href} variant="secondary">
                {hero.tertiaryCta.label}
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Right — cinematic portrait */}
        <figure
          className="relative order-first h-[50vw] min-h-[280px] overflow-hidden lg:order-last lg:col-span-5 lg:h-auto xl:col-span-6"
          aria-label={portrait.alt}
        >
          {/* Portrait entrance — single shot, no repeat */}
          <div className="grain-overlay absolute inset-0 motion-safe:[animation:portrait-enter_1100ms_var(--ease-editorial)_both]">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              placeholder="blur"
              fetchPriority="high"
              loading="eager"
              quality={90}
              fill
              sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_18%]"
            />
          </div>

          {/* Gradient vignette — left edge fades into ivory on desktop */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ivory to-transparent lg:block hidden"
          />

          {/* Gold corner frame — bottom-right */}
          <div aria-hidden className="absolute right-4 bottom-4 h-16 w-16 border-r border-b border-gold/60 sm:right-6 sm:bottom-6 sm:h-20 sm:w-20" />

          {/* Name caption — bottom left */}
          <figcaption className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
            <span className="block font-display text-lg text-ivory drop-shadow-sm">{bio.name}</span>
            <span className="block font-sans text-eyebrow font-semibold text-gold-light uppercase tracking-[0.22em]">
              Founder
            </span>
          </figcaption>
        </figure>
      </div>

      {/* ── Role banner ── */}
      <div className="border-y border-sand/70 bg-ivory">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 font-sans text-eyebrow font-semibold text-stone uppercase sm:justify-between">
            {bio.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
            <li className="text-gold-ink">{bio.yearsInMinistry} years in ministry</li>
          </ul>
        </Container>
      </div>
    </section>
  );
}
