import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getGiving, getHomeContent } from "@/lib/content";

export function DonationCTA() {
  const { partner } = getHomeContent();
  const giving = getGiving();

  return (
    <section aria-labelledby="partner-heading" className="py-section">
      <Container>
        <Reveal className="relative mx-auto max-w-4xl border border-sand px-6 py-16 text-center sm:px-16 sm:py-20">
          {/* Gold corner marks echo the portrait frames used elsewhere on the page. */}
          <span aria-hidden className="absolute -top-px -left-px h-10 w-10 border-t border-l border-gold" />
          <span aria-hidden className="absolute -right-px -bottom-px h-10 w-10 border-r border-b border-gold" />

          <Eyebrow className="justify-center">{partner.eyebrow}</Eyebrow>
          <h2 id="partner-heading" className="mt-6 font-display text-display-lg font-medium text-balance">
            {partner.heading}
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lede text-pretty text-stone">{partner.body}</p>

          <div className="mt-10 flex flex-col items-center gap-5">
            <ButtonLink href={partner.cta.href} arrow>
              {partner.cta.label}
            </ButtonLink>
            <p className="text-sm text-stone">
              Give by card through Stripe, or by Cash App at{" "}
              <a
                href={giving.cashAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-espresso underline decoration-gold underline-offset-4 hover:text-ember"
              >
                {giving.cashAppHandle}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
