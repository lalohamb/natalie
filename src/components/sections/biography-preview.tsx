import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBio, getHomeContent, getPortraits } from "@/lib/content";

export function BiographyPreview() {
  const { introduction } = getHomeContent();
  const bio = getBio();
  const portrait = getPortraits().garden;

  return (
    <section aria-labelledby="introduction-heading" className="py-8 overflow-hidden lg:py-10">
      <Container className="grid items-center gap-6 lg:grid-cols-12 lg:gap-6">

        {/* Left — text column */}
        <Reveal className="lg:col-span-6" delay={0.08}>
          <SectionHeading
            id="introduction-heading"
            eyebrow={introduction.eyebrow}
            title={introduction.heading}
            size="md"
          />

          <p className="mt-3 text-lede text-pretty text-stone leading-relaxed line-clamp-4">{bio.short}</p>

          {/* Pull-quote */}
          <blockquote className="mt-4 border-l-2 border-gold pl-5">
            <p className="font-display text-[1.1rem] leading-snug text-espresso italic text-balance">
              &ldquo;{bio.identityLine}&rdquo;
            </p>
          </blockquote>

          <ButtonLink href={introduction.cta.href} variant="primary" className="mt-5">
            {introduction.cta.label}
          </ButtonLink>
        </Reveal>

        {/* Right — portrait column */}
        <Reveal className="lg:col-span-5 lg:col-start-8">
          <figure className="relative">
            {/* Linen wash behind the frame */}
            <div className="absolute -inset-2 -z-10 bg-linen lg:-inset-3" aria-hidden />

            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                placeholder="blur"
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 42vw, 100vw"
                className="h-full w-full object-cover object-[28%_20%]"
              />
            </div>

            {/* Gold corner frames */}
            <div aria-hidden className="absolute -right-3 -bottom-3 h-20 w-20 border-r-2 border-b-2 border-gold" />
            <div aria-hidden className="absolute -top-3 -left-3 h-12 w-12 border-t border-l border-gold/60" />

            <figcaption className="mt-5 pl-1">
              <span className="block font-display text-lg font-medium text-espresso">{bio.name}</span>
              <span className="block font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em] mt-1">
                Prophet · Author · Speaker
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}
