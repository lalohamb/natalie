import type { Metadata } from "next";
import { BookOpen, Flame, Sprout, Users, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import type { EmphasisSegment } from "@/content/partnership";
import { getGiving } from "@/lib/giving";
import { getPartnershipContent, getSite } from "@/lib/content";

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

export default async function PartnershipsPage() {
  const giving = await getGiving();
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stripe */}
            <Reveal>
              <div className="relative flex h-full flex-col gap-6 border border-sand p-8 sm:p-10">
                <span aria-hidden className="absolute top-0 left-0 h-8 w-8 border-t border-l border-gold" />
                <span aria-hidden className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-gold" />
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <Eyebrow rule={false}>Give by card</Eyebrow>
                    <StripeLogo />
                  </div>
                  <h3 className="mt-4 font-display text-display-sm font-medium">
                    Secure online giving
                  </h3>
                  <p className="mt-5 text-pretty text-stone">
                    Give securely by credit or debit card through Stripe. Your gift goes directly
                    to support the work of Natalie Flemons Ministries.
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
                  <div className="flex items-center justify-between gap-4">
                    <Eyebrow rule={false}>Give by Cash App</Eyebrow>
                    <CashAppLogo />
                  </div>
                  <h3 className="mt-4 font-display text-display-sm font-medium">
                    Cash App
                  </h3>
                  <p className="mt-5 text-pretty text-stone">
                    Send your gift directly via Cash App to{" "}
                    <span className="font-semibold text-espresso">{giving.cashAppHandle}</span>.
                  </p>
                </div>
                <ButtonLink href={giving.cashAppUrl} variant="secondary" className="self-start mt-auto">
                  Open Cash App
                </ButtonLink>
              </div>
            </Reveal>

            {/* Zelle */}
            <Reveal delay={0.16}>
              <div className="relative flex h-full flex-col gap-6 border border-sand p-8 sm:p-10">
                <span aria-hidden className="absolute top-0 left-0 h-8 w-8 border-t border-l border-gold" />
                <span aria-hidden className="absolute right-0 bottom-0 h-8 w-8 border-r border-b border-gold" />
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <Eyebrow rule={false}>Give by Zelle</Eyebrow>
                    <ZelleLogo />
                  </div>
                  <h3 className="mt-4 font-display text-display-sm font-medium">
                    Zelle
                  </h3>
                  <p className="mt-5 text-pretty text-stone">
                    Send your gift directly via Zelle to{" "}
                    <span className="font-semibold text-espresso">{giving.zelleEmail}</span>.
                  </p>
                </div>
                <ButtonLink href={`https://enroll.zellepay.com/qr-codes?data=${encodeURIComponent(giving.zelleEmail)}`} variant="secondary" className="self-start mt-auto">
                  Open Zelle
                </ButtonLink>
              </div>
            </Reveal>
          </div>
          <p className="mt-8 text-center text-sm text-stone italic">
            Natalie Flemons Ministries LLC is not a registered nonprofit. Gifts are not tax-deductible.
          </p>
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

function StripeLogo() {
  return (
    <svg aria-label="Stripe" role="img" viewBox="0 0 60 25" className="h-5 w-auto opacity-30">
      <path
        fill="currentColor"
        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.5 0 3 .25 4.43.82v3.88a9.23 9.23 0 0 0-4.43-1.24c-.86 0-1.42.23-1.42.96 0 1.77 6.34.7 6.34 5.82z"
      />
    </svg>
  );
}

function CashAppLogo() {
  return (
    <svg aria-label="Cash App" role="img" viewBox="0 0 56 20" className="h-4 w-auto opacity-30">
      <path
        fill="currentColor"
        d="M10.01 0C4.48 0 0 4.48 0 10.01 0 15.53 4.48 20 10.01 20c5.52 0 10-4.47 10-9.99C20.01 4.48 15.53 0 10.01 0zm2.3 13.7c-.44.44-1.04.68-1.66.68H9.4v.74a.5.5 0 0 1-.5.5h-.8a.5.5 0 0 1-.5-.5v-.74H6.5a.5.5 0 0 1-.5-.5v-.8a.5.5 0 0 1 .5-.5h3.15c.28 0 .5-.22.5-.5v-.5c0-.28-.22-.5-.5-.5H8.1c-.62 0-1.22-.24-1.66-.68A2.35 2.35 0 0 1 5.76 9c0-.62.24-1.22.68-1.66.44-.44 1.04-.68 1.66-.68h.66v-.74a.5.5 0 0 1 .5-.5h.8a.5.5 0 0 1 .5.5v.74h1.1a.5.5 0 0 1 .5.5v.8a.5.5 0 0 1-.5.5H8.52a.5.5 0 0 0-.5.5v.5c0 .28.22.5.5.5h1.55c.62 0 1.22.24 1.66.68.44.44.68 1.04.68 1.66 0 .62-.24 1.22-.68 1.66h.08zM28.5 5.5h-2.1l-1.4 4.2-1.4-4.2h-2.1l2.5 7h2l2.5-7zm5.5 0h-2v7h2v-7zm-1-2.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm8 2.3c-.7 0-1.3.25-1.75.7V5.5h-2v9.5h2v-3.3c.45.45 1.05.7 1.75.7 1.8 0 3-1.4 3-3.55s-1.2-3.55-3-3.55zm-.5 5.45c-.85 0-1.4-.65-1.4-1.9s.55-1.9 1.4-1.9 1.4.65 1.4 1.9-.55 1.9-1.4 1.9zm9.5-5.45c-.7 0-1.3.25-1.75.7V5.5h-2v9.5h2v-3.3c.45.45 1.05.7 1.75.7 1.8 0 3-1.4 3-3.55s-1.2-3.55-3-3.55zm-.5 5.45c-.85 0-1.4-.65-1.4-1.9s.55-1.9 1.4-1.9 1.4.65 1.4 1.9-.55 1.9-1.4 1.9z"
      />
    </svg>
  );
}

function ZelleLogo() {
  return (
    <svg aria-label="Zelle" role="img" viewBox="0 0 50 20" className="h-4 w-auto opacity-30">
      <path
        fill="currentColor"
        d="M5.8 2h10.4l.8 2.2L4.6 14.6H17v3.4H5.8L5 15.8 17.4 5.4H5.8V2zM20 2h3.6v16H20V2zm6 0h10v3.2h-6.4v3h5.8v3h-5.8v3.6H36V18H26V2zm12 0h10v3.2h-6.4v3h5.8v3h-5.8v3.6H48V18H38V2z"
      />
    </svg>
  );
}
