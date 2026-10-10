import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getBio, getHomeContent, getPortraits } from "@/lib/content";

export function HeroSection() {
  const { hero } = getHomeContent();
  const portrait = getPortraits().autumn;
  const bio = getBio();
  const [lineOne, lineTwo, emphasis] = hero.headline;

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <Container className="grid items-center gap-14 pt-10 pb-16 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-24">
        <div className="lg:col-span-7 lg:pr-8">
          <Eyebrow className="motion-safe:animate-rise">{hero.eyebrow}</Eyebrow>

          <h1
            id="hero-heading"
            className="mt-8 font-display text-display-xl font-medium text-espresso uppercase motion-safe:animate-rise [animation-delay:80ms]"
          >
            <span className="block">{lineOne}</span>
            <span className="block">{lineTwo}</span>
            <span className="block text-ember normal-case italic">{emphasis}</span>
          </h1>

          <p className="mt-8 max-w-xl font-display text-[1.6rem] leading-snug text-balance text-stone italic motion-safe:animate-rise [animation-delay:160ms] sm:text-[1.85rem]">
            {hero.supporting}
          </p>

          <div className="mt-10 flex flex-col gap-4 motion-safe:animate-rise [animation-delay:240ms] sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.tertiaryCta.href} variant="text" arrow className="self-start sm:ml-3 sm:self-auto">
              {hero.tertiaryCta.label}
            </ButtonLink>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-md motion-safe:animate-fade [animation-delay:120ms] lg:col-span-5 lg:max-w-none">
          {/* Offset linen panel and gold frame give the portrait an editorial mount. */}
          <div aria-hidden className="absolute -right-4 -bottom-4 left-8 top-8 bg-linen sm:-right-6 sm:-bottom-6" />
          <div aria-hidden className="absolute -top-3 -left-3 h-24 w-24 border-t border-l border-gold" />
          <div className="relative aspect-[4/5] overflow-hidden bg-linen">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              placeholder="blur"
              fetchPriority="high"
              loading="eager"
              quality={85}
              sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, (min-width: 448px) 448px, 100vw"
              className="h-full w-full object-cover object-[50%_22%]"
            />
          </div>
          <figcaption className="relative mt-8 flex items-baseline justify-between gap-4 pr-2 text-sm">
            <span className="font-display text-xl text-espresso">{bio.name}</span>
            <span className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Founder</span>
          </figcaption>
        </figure>
      </Container>

      <div className="border-y border-sand/70 bg-ivory">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 font-sans text-eyebrow font-semibold text-stone uppercase sm:justify-between">
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
