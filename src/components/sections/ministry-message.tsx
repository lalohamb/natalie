"use client";

import { m, LazyMotion, domAnimation, useInView } from "motion/react";
import { useRef } from "react";
import { ActivateSymbol } from "@/components/animations/activate-symbol";
import { EquipSymbol } from "@/components/animations/equip-symbol";
import { RestoreSymbol } from "@/components/animations/restore-symbol";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { MinistryPillar } from "@/content/types";

const ease = [0.22, 1, 0.36, 1] as const;

function PillarSymbol({ id, inView, delay }: { id: MinistryPillar["id"]; inView: boolean; delay: number }) {
  if (id === "equip") return <EquipSymbol inView={inView} delay={delay} />;
  if (id === "restore") return <RestoreSymbol inView={inView} delay={delay} />;
  return <ActivateSymbol inView={inView} delay={delay} />;
}

function PillarCard({ pillar, index }: { pillar: MinistryPillar; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const symbolDelay = index * 0.12 + 0.04;

  return (
    <li
      ref={ref}
      className="border-b border-ivory/15 py-8 md:border-b-0 md:px-8 md:py-10 md:not-first:border-l md:first:pl-0 md:last:pr-0"
    >
      <LazyMotion features={domAnimation} strict>
        <m.p
          aria-hidden
          className="font-sans text-eyebrow font-semibold text-gold-light"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease, delay: index * 0.12 }}
        >
          {String(index + 1).padStart(2, "0")}
        </m.p>

        <m.div
          className="mt-4 mb-1"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, ease, delay: symbolDelay }}
        >
          <PillarSymbol id={pillar.id} inView={inView} delay={symbolDelay} />
        </m.div>

        <m.h3
          className="mt-4 font-display text-display-sm font-medium uppercase tracking-wide text-ivory"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: index * 0.12 + 0.08 }}
        >
          {pillar.name}
        </m.h3>

        <m.p
          className="mt-2 font-display text-base italic text-mist"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: index * 0.12 + 0.16 }}
        >
          {pillar.tagline}
        </m.p>

        <m.p
          className="mt-3 text-pretty text-mist leading-relaxed line-clamp-3"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease, delay: index * 0.12 + 0.26 }}
        >
          {pillar.description}
        </m.p>

        <m.span
          aria-hidden
          className="mt-6 block h-px bg-gold-light/40 origin-left"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, ease, delay: index * 0.12 + 0.3 }}
        />
      </LazyMotion>
    </li>
  );
}

export function MinistryMessage({ message, pillars }: { message: { eyebrow: string; heading: string; lede: string }; pillars: MinistryPillar[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingInView = useInView(sectionRef, { once: true, margin: "0px 0px -8% 0px" });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="message-heading"
      className="bg-espresso py-14 text-ivory lg:py-16"
    >
      <Container>
        <LazyMotion features={domAnimation} strict>
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease }}
            className="max-w-2xl"
          >
            <Eyebrow tone="dark">{message.eyebrow}</Eyebrow>
            <h2
              id="message-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              {message.heading}
            </h2>
            <p className="mt-5 text-pretty text-mist max-w-prose">{message.lede}</p>
          </m.div>
        </LazyMotion>

        <ol className="mt-10 grid gap-0 border-t border-ivory/15 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </ol>

        <LazyMotion features={domAnimation} strict>
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="mt-10"
          >
            <ButtonLink href="/ministry" variant="outline-inverse">
              Learn More About the Ministry
            </ButtonLink>
          </m.div>
        </LazyMotion>
      </Container>
    </section>
  );
}
