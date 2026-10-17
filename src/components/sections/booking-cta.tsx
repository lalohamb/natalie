import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getHomeContent } from "@/lib/content";

const audiences = ["Churches", "Ministries", "Organizations", "Event coordinators"];

export function BookingCTA() {
  const { booking } = getHomeContent();

  return (
    <section aria-labelledby="booking-heading" className="grid lg:grid-cols-[5fr_7fr]">
      {/* Left — forest editorial panel */}
      <div className="relative overflow-hidden bg-forest px-gutter py-section text-ivory flex flex-col justify-center">
        {/* Decorative background word */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none font-display text-[clamp(6rem,14vw,14rem)] font-medium uppercase leading-none text-ivory/[0.05] tracking-tight"
        >
          Invite
        </span>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <Reveal>
          <Eyebrow tone="dark">{booking.eyebrow}</Eyebrow>
          <h2
            id="booking-heading"
            className="mt-6 font-display text-display-xl font-medium uppercase leading-[0.93]"
          >
            {booking.heading}
          </h2>
          <p className="mt-8 max-w-sm text-lede text-pretty text-mist">{booking.body}</p>
          <ButtonLink href={booking.cta.href} variant="inverse" arrow className="mt-10">
            {booking.cta.label}
          </ButtonLink>
        </Reveal>
      </div>

      {/* Right — ivory supporting panel */}
      <div className="bg-ivory px-gutter py-section flex flex-col justify-center">
        <Reveal delay={0.1}>
          <p className="font-sans text-eyebrow font-semibold text-gold-ink uppercase tracking-[0.22em] mb-8">
            Serving
          </p>
          <ul>
            {audiences.map((audience) => (
              <li
                key={audience}
                className="flex items-center gap-4 border-b border-sand py-4 font-display text-xl text-espresso italic last:border-b-0"
              >
                <span aria-hidden className="block h-px w-5 shrink-0 bg-gold/60" />
                {audience}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
