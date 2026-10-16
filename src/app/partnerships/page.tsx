import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { getGiving, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Partnerships",
  description:
    "Partner with Natalie Flemons Ministries. Your support helps carry this message forward.",
  alternates: { canonical: "/partnerships" },
  openGraph: { url: "/partnerships" },
};

export default function PartnershipsPage() {
  const giving = getGiving();
  const site = getSite();

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="partnerships-heading" className="bg-linen py-section">
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

      {/* ── Giving options ── */}
      <section aria-labelledby="giving-heading" className="py-section">
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
              <div className="relative flex flex-col gap-6 border border-sand p-8">
                <span aria-hidden className="absolute -top-px -left-px h-8 w-8 border-t border-l border-gold" />
                <div>
                  <Eyebrow rule={false}>Give by card</Eyebrow>
                  <h3 className="mt-3 font-display text-display-sm font-medium">
                    Secure online giving
                  </h3>
                  <p className="mt-4 text-pretty text-stone">
                    Give securely by credit or debit card through Stripe. Your gift goes directly
                    to support the work of Natalie Flemons Ministries.
                  </p>
                  <p className="mt-3 text-sm text-stone italic">
                    Natalie Flemons Ministries LLC is not a registered nonprofit.
                    Gifts are not tax-deductible.
                  </p>
                </div>
                <ButtonLink href={giving.stripeUrl} className="self-start">
                  Give by Card
                </ButtonLink>
              </div>
            </Reveal>

            {/* Cash App */}
            <Reveal delay={0.08}>
              <div className="relative flex flex-col gap-6 border border-sand p-8">
                <span aria-hidden className="absolute -top-px -left-px h-8 w-8 border-t border-l border-gold" />
                <div>
                  <Eyebrow rule={false}>Give by Cash App</Eyebrow>
                  <h3 className="mt-3 font-display text-display-sm font-medium">
                    Cash App
                  </h3>
                  <p className="mt-4 text-pretty text-stone">
                    Send your gift directly via Cash App to{" "}
                    <span className="font-semibold text-espresso">{giving.cashAppHandle}</span>.
                  </p>
                  <p className="mt-3 text-sm text-stone italic">
                    Natalie Flemons Ministries LLC is not a registered nonprofit.
                    Gifts are not tax-deductible.
                  </p>
                </div>
                <ButtonLink href={giving.cashAppUrl} variant="secondary" className="self-start">
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

      <NewsletterSection />
    </>
  );
}
