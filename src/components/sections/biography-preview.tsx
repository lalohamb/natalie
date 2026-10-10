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
    <section aria-labelledby="introduction-heading" className="py-section">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-6">
          <figure className="relative">
            <div className="relative aspect-[4/3] overflow-hidden bg-linen lg:aspect-[5/4]">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                placeholder="blur"
                sizes="(min-width: 1280px) 620px, (min-width: 1024px) 48vw, 100vw"
                className="h-full w-full object-cover object-[28%_40%]"
              />
            </div>
            <div aria-hidden className="absolute -right-3 -bottom-3 h-24 w-24 border-r border-b border-gold" />
          </figure>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.1}>
          <SectionHeading
            id="introduction-heading"
            eyebrow={introduction.eyebrow}
            title={introduction.heading}
            size="md"
          />
          <p className="mt-8 text-lede text-pretty text-stone">{bio.short}</p>
          <p className="mt-6 text-pretty text-stone">{bio.speakingSummary}</p>
          <ButtonLink href={introduction.cta.href} variant="text" arrow className="mt-8">
            {introduction.cta.label}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
