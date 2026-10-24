import type { Metadata } from "next";
import { BookOpen, Flame, Sprout, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import type { EmphasisSegment } from "@/content/partnership";
import { getGiving, getPartnershipContent, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Partnerships",
  description:
    "Partner with Natalie Flemons Ministries in equipping believers, restoring purity and integrity, and activating people to fulfill their God-given assignments.",
  alternates: { canonical: "/partnerships" },
  openGraph: { url: "/partnerships" },
};

const SUPPORT_ICONS: Record<string, LucideIcon> = {
  teaching: BookOpen,
  prayer: Flame,
  leadership: Users,
  resources: Sprout,
};

/** Renders verbatim copy, styling the emphasised phrases. */
function Emphasised({ segments, className }: { segments: readonly EmphasisSegment[]; className: string }) {
  return segments.map((segment, i) =>
    segment.emphasis ? (
      <em key={i} className={className}>
        {segment.text}
      </em>
    ) : (
      <span key={i}>{segment.text}</span>
    ),
  );
}

export default function PartnershipsPage() {
  const giving = getGiving();
  const site = getSite();
  const { why, supports, investment } = getPartnershipContent();

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="partnerships-heading" className="border-b border-sand bg-linen py-16">
        <Container className="max-w-4xl">
          <SectionHeading
            as="h1"
            id="partnerships-heading"
            eyebrow="Partner With the Ministry"
            title="Partner With the Vision"
            lede="Thank you for sowing into Natalie Flemons Ministries. Your partnership helps carry this message forward. You are sowing into good ground — may the Lord bless and prosper you."
            className="motion-safe:animate-rise"
          />
        </Container>
      </section>

      {/* ── Why partner ── */}
      <section aria-labelledby="why-partner-heading" className="py-section">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <Eyebrow>{why.eyebrow}</Eyebrow>
            <h2
              id="why-partner-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              {why.heading}
            </h2>
            <p className="mt-8 text-lede text-pretty text-stone">
              <Emphasised
                segments={why.commitment}
                className="font-display text-[1.15em] text-espresso italic decoration-gold/60 decoration-1 underline-offset-[6px] [text-decoration-line:underline]"
              />
            </p>
            <ButtonLink href={why.cta.href} variant="text" arrow className="mt-8">
              {why.cta.label}
            </ButtonLink>
          </Reveal>

          <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
            <h3 className="font-sans text-eyebrow font-semibold tracking-[0.22em] text-gold-ink uppercase">
              {supports.eyebrow}
            </h3>
            <p className="mt-5 text-pretty text-stone">{supports.generosity}</p>

            <ol className="mt-8 border-t border-sand">
              {supports.items.map((item, index) => {
                const Icon = SUPPORT_ICONS[item.id] ?? BookOpen;
                return (
                  <li
                    key={item.id}
                    className="group flex items-center gap-5 border-b border-sand py-5 sm:gap-7 sm:py-6"
                  >
                    <span aria-hidden className="w-7 shrink-0 font-sans text-eyebrow font-semibold text-gold-ink tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden
                      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-ink transition-colors duration-300 group-hover:border-ember group-hover:bg-ember group-hover:text-ivory"
                    >
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-display text-xl leading-snug font-medium text-espresso text-balance sm:text-2xl">
                      {item.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </Container>
      </section>

      {/* ── Investment statement ── */}
      <section aria-label={investment.eyebrow} className="bg-forest py-section text-ivory">
        <Container className="max-w-4xl">
          <Reveal>
            <figure className="relative px-6 py-12 text-center sm:px-16 sm:py-16">
              <span aria-hidden className="absolute top-0 left-0 h-12 w-12 border-t border-l border-gold-light/70" />
              <span aria-hidden className="absolute right-0 bottom-0 h-12 w-12 border-r border-b border-gold-light/70" />
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-display text-[7rem] leading-none text-gold-light/25 select-none"
              >
                &ldquo;
              </span>

              <Eyebrow tone="dark" className="justify-center">
                {investment.eyebrow}
              </Eyebrow>
              <blockquote className="mt-8">
                <p className="font-display text-display-md font-medium text-balance sm:text-display-lg"
                >
                  <Emphasised segments={investment.statement} className="text-gold-light italic" />
                </p>
              </blockquote>
              <ButtonLink href={investment.cta.href} variant="inverse" arrow className="mt-10">
                {investment.cta.label}
              </ButtonLink>
            </figure>
          </Reveal>
        </Container>
      </section>

      {/* ── Giving options ── */}
      <section id="giving" aria-labelledby="giving-heading" className="scroll-mt-24 py-section">
        <Container>
          <Reveal>
            <h2
              id="giving-heading"
              className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]"
            >
              Ways to give
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Stripe */}
            <Reveal>
              <div className="relative flex h-full flex-col gap-6 border border-sand p-8 sm:p-10">
                <span aria-hidden className="absolute top-0 left-0 h-8 w-8 border-t border-l border-gold" />
                <span aria-hidden className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-gold" />
                <div>
                  <Eyebrow rule={false}>Give by card</Eyebrow>
                  <h3 className="mt-4 font-display text-display-sm font-medium">
                    Secure online giving
                  </h3>
                  <p className="mt-5 text-pretty text-stone">
                    Give securely by credit or debit card through Stripe. Your gift goes directly
                    to support the work of Natalie Flemons Ministries.
                  </p>
                  <p className="mt-3 text-sm text-stone italic">
                    Natalie Flemons Ministries LLC is not a registered nonprofit.
                    Gifts are not tax-deductible.
                  </p>
                </div>
                <ButtonLink href={giving.stripeUrl} className="self-start mt-auto">
                  Give by Card
                </ButtonLink>
              </div>
            </Reveal>

            {/* Cash App */}
            <Reveal delay={0.08}>
              <div className="relative flex h-full flex-col gap-6 border border-sand p-8 sm:p-10">
                <span aria-hidden className="absolute top-0 left-0 h-8 w-8 border-t border-l border-gold" />
                <span aria-hidden className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-gold" />
                <div>
                  <Eyebrow rule={false}>Give by Cash App</Eyebrow>
                  <h3 className="mt-4 font-display text-display-sm font-medium">
                    Cash App
                  </h3>
                  <p className="mt-5 text-pretty text-stone">
                    Send your gift directly via Cash App to{" "}
                    <span className="font-semibold text-espresso">{giving.cashAppHandle}</span>.
                  </p>
                  <p className="mt-3 text-sm text-stone italic">
                    Natalie Flemons Ministries LLC is not a registered nonprofit.
                    Gifts are not tax-deductible.
                  </p>
                </div>
                <ButtonLink href={giving.cashAppUrl} variant="secondary" className="self-start mt-auto">
                  Open Cash App
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Mission statement ── */}
      <section aria-labelledby="mission-statement-heading" className="bg-espresso py-section text-ivory">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <Eyebrow tone="dark" className="justify-center">The Mission</Eyebrow>
            <h2
              id="mission-statement-heading"
              className="mt-6 font-display text-display-lg font-medium text-balance"
            >
              &ldquo;{site.mission}&rdquo;
            </h2>
            <p className="mx-auto mt-8 max-w-prose text-lede text-pretty text-mist">
              Every gift sown into this ministry helps equip believers, strengthen prophetic
              integrity, and carry the message of destiny to those who need it most.
            </p>
          </Reveal>
        </Container>
      </section>

     {/*  <NewsletterSection /> */}
    </>
  );
}
