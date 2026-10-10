import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getHomeContent } from "@/lib/content";

const audiences = ["Churches", "Ministries", "Organizations", "Event coordinators"];

export function BookingCTA() {
  const { booking } = getHomeContent();

  return (
    <section aria-labelledby="booking-heading" className="bg-forest py-section text-ivory">
      <Container>
        <Reveal className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow tone="dark">{booking.eyebrow}</Eyebrow>
            <h2
              id="booking-heading"
              className="mt-6 font-display text-display-xl font-medium uppercase"
            >
              {booking.heading}
            </h2>
            <p className="mt-8 max-w-xl text-lede text-pretty text-mist">{booking.body}</p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <ul className="border-t border-ivory/20">
              {audiences.map((audience) => (
                <li
                  key={audience}
                  className="border-b border-ivory/20 py-3.5 font-display text-xl text-ivory italic"
                >
                  {audience}
                </li>
              ))}
            </ul>
            <ButtonLink href={booking.cta.href} variant="inverse" arrow className="mt-10 w-full sm:w-auto">
              {booking.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
