import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { getGiving } from "@/lib/giving";
import { getHomeContent } from "@/lib/content";

function BotanicalMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M60 155 C60 100 60 60 60 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M60 120 C40 110 20 115 8 105" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60 90 C44 78 28 80 18 68" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60 60 C46 48 34 50 26 38" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60 130 C76 118 94 122 106 112" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60 100 C74 88 90 90 100 78" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M60 70 C72 58 86 60 94 48" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="6" cy="103" rx="5" ry="3" transform="rotate(-20 6 103)" fill="currentColor" opacity="0.6" />
      <ellipse cx="16" cy="66" rx="5" ry="3" transform="rotate(-30 16 66)" fill="currentColor" opacity="0.6" />
      <ellipse cx="24" cy="36" rx="4" ry="2.5" transform="rotate(-40 24 36)" fill="currentColor" opacity="0.6" />
      <ellipse cx="108" cy="110" rx="5" ry="3" transform="rotate(20 108 110)" fill="currentColor" opacity="0.6" />
      <ellipse cx="102" cy="76" rx="5" ry="3" transform="rotate(30 102 76)" fill="currentColor" opacity="0.6" />
      <ellipse cx="96" cy="46" rx="4" ry="2.5" transform="rotate(40 96 46)" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export async function DonationCTA() {
  const { partner } = getHomeContent();
  const giving = await getGiving();

  return (
    <section aria-labelledby="partner-heading" className="bg-ivory py-12 lg:py-14">
      <Container>
        <Reveal>
          <div className="grid items-center gap-6 border-t border-b border-sand py-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0 lg:py-12">

            {/* Left — headline */}
            <div className="lg:pr-12">
              <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em]">
                {partner.eyebrow}
              </p>
              <h2
                id="partner-heading"
                className="mt-5 font-display text-display-md font-medium text-balance leading-[1.05]"
              >
                {partner.heading}
              </h2>
              <p className="mt-4 text-pretty text-stone">{partner.body}</p>
            </div>

            {/* Centre — botanical divider */}
            <div aria-hidden className="hidden lg:flex lg:items-center lg:justify-center lg:px-10">
              <BotanicalMark className="h-28 w-auto text-gold/50" />
            </div>
            <div aria-hidden className="block h-px w-full bg-sand lg:hidden" />

            {/* Right — CTA */}
            <div className="lg:pl-12">
              <ButtonLink href={partner.cta.href} arrow>
                {partner.cta.label}
              </ButtonLink>
              <p className="mt-5 text-sm text-stone">
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
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
