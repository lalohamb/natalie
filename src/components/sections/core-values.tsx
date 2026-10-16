"use client";

import { m, LazyMotion, domAnimation, useInView } from "motion/react";
import { useRef } from "react";
import { ActivateSymbol } from "@/components/animations/activate-symbol";
import { EquipSymbol } from "@/components/animations/equip-symbol";
import { RestoreSymbol } from "@/components/animations/restore-symbol";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getMinistryIdentity } from "@/lib/content";
import type { MinistryPillar } from "@/content/types";

const ease = [0.22, 1, 0.36, 1] as const;

function PillarSymbol({
  id,
  inView,
  delay,
}: {
  id: MinistryPillar["id"];
  inView: boolean;
  delay: number;
}) {
  if (id === "equip") return <EquipSymbol inView={inView} delay={delay} />;
  if (id === "restore") return <RestoreSymbol inView={inView} delay={delay} />;
  return <ActivateSymbol inView={inView} delay={delay} />;
}

function PillarCard({
  pillar,
  index,
}: {
  pillar: MinistryPillar;
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  // Symbol animates slightly after the number, before the name
  const symbolDelay = index * 0.12 + 0.04;

  return (
    <li
      ref={ref}
      className="border-b border-ivory/15 py-10 md:border-b-0 md:px-8 md:py-14 md:not-first:border-l md:first:pl-0 md:last:pr-0"
    >
      <LazyMotion features={domAnimation} strict>
        {/* Number */}
        <m.p
          aria-hidden
          className="font-sans text-eyebrow font-semibold text-gold-light"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: index * 0.12 }}
        >
          {String(index + 1).padStart(2, "0")}
        </m.p>

        {/* SVG symbol — decorative, aria-hidden inside component */}
        <m.div
          className="mt-5 mb-1"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: symbolDelay }}
        >
          <PillarSymbol id={pillar.id} inView={inView} delay={symbolDelay} />
        </m.div>

        {/* Name */}
        <m.h3
          className="mt-5 font-display text-display-sm font-medium uppercase tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: index * 0.12 + 0.08 }}
        >
          {pillar.name}
        </m.h3>

        {/* Tagline */}
        <m.p
          className="mt-2 font-display text-base italic text-mist"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: index * 0.12 + 0.16 }}
        >
          {pillar.tagline}
        </m.p>

        {/* Description */}
        <m.p
          className="mt-5 text-pretty text-mist leading-relaxed"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease, delay: index * 0.12 + 0.26 }}
        >
          {pillar.description}
        </m.p>

        {/* Gold rule grow-in */}
        <m.span
          aria-hidden
          className="mt-8 block h-px bg-gold-light/40 origin-left"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease, delay: index * 0.12 + 0.3 }}
        />
      </LazyMotion>
    </li>
  );
}

export function CoreValues() {
  const { pillars, statement } = getMinistryIdentity();
  const sectionRef = useRef<HTMLElement>(null);
  const headingInView = useInView(sectionRef, { once: true, margin: "0px 0px -8% 0px" });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="core-values-heading"
      className="bg-forest py-section text-ivory"
    >
      <Container>
        <LazyMotion features={domAnimation} strict>
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
          >
            <Eyebrow tone="dark">Our Core Values</Eyebrow>
            <h2
              id="core-values-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              Equipping. Restoring. Activating.
            </h2>
            <p className="mt-4 max-w-prose text-lede text-pretty text-mist">
              Three Core Values. One Kingdom Mission.
            </p>
          </m.div>
        </LazyMotion>

        <ol className="mt-16 grid gap-0 border-t border-ivory/15 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </ol>

        <LazyMotion features={domAnimation} strict>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
          >
            <blockquote className="mt-16 border-t border-ivory/15 pt-10 max-w-3xl">
              <p className="font-display text-display-sm italic text-ivory/90 leading-snug">
                &ldquo;{statement}&rdquo;
              </p>
            </blockquote>
            <div className="mt-8">
              <ButtonLink href="/ministry" variant="outline-inverse">
                Learn More About the Ministry
              </ButtonLink>
            </div>
          </m.div>
        </LazyMotion>
      </Container>
    </section>
  );
}
