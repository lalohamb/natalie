import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getEvent, getEvents } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

// When the events array is empty, generateStaticParams cannot return an empty
// array under cacheComponents: true (Next.js 16 requirement). The placeholder
// slug will hit notFound() at runtime; real slugs are added as events are published.
export async function generateStaticParams() {
  const params = getEvents().map((e) => ({ slug: e.slug }));
  return params.length > 0 ? params : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description,
    alternates: { canonical: `/events/${slug}` },
    openGraph: { url: `/events/${slug}` },
  };
}

const STATUS_LABELS = {
  scheduled: "Upcoming",
  postponed: "Postponed",
  cancelled: "Cancelled",
  completed: "Past event",
} as const;

const CATEGORY_LABELS = {
  conference: "Conference",
  workshop: "Workshop",
  service: "Service",
  appearance: "Appearance",
  other: "Event",
} as const;

function formatFullDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(new Date(iso));
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const location = [event.venue, event.city, event.state, event.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <article aria-labelledby="event-title">
        {/* ── Header ── */}
        <section className="border-b border-sand bg-linen py-16">
          <Container>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 font-sans text-sm text-stone">
                <li><Link href="/events" className="hover:text-espresso">Events</Link></li>
                <li aria-hidden>/</li>
                <li className="text-espresso" aria-current="page">{event.title}</li>
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-3 motion-safe:animate-rise">
              <span className="inline-flex items-center rounded-sm bg-forest/10 px-2.5 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-forest">
                {STATUS_LABELS[event.status]}
              </span>
              <Eyebrow rule={false}>{CATEGORY_LABELS[event.category]}</Eyebrow>
            </div>

            <h1
              id="event-title"
              className="mt-6 font-display text-display-lg font-medium text-balance motion-safe:animate-rise [animation-delay:80ms]"
            >
              {event.title}
            </h1>
          </Container>
        </section>

        {/* ── Details ── */}
        <section aria-label="Event details" className="py-section">
          <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
            {/* Main content */}
            <Reveal className="lg:col-span-7">
              <p className="text-lede text-pretty text-stone">{event.description}</p>

              {event.registrationUrl && event.status === "scheduled" && (
                <div className="mt-10">
                  <ButtonLink href={event.registrationUrl}>Register for this event</ButtonLink>
                </div>
              )}
            </Reveal>

            {/* Sidebar */}
            <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
              <dl className="flex flex-col gap-6 border border-sand p-6">
                <div>
                  <dt className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Date</dt>
                  <dd className="mt-2 font-sans text-sm text-espresso">
                    {formatFullDate(event.startDate, event.timeZone)}
                    {event.endDate && (
                      <> – {formatFullDate(event.endDate, event.timeZone)}</>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Time</dt>
                  <dd className="mt-2 font-sans text-sm text-espresso">
                    {formatTime(event.startDate, event.timeZone)}
                  </dd>
                </div>

                {location && (
                  <div>
                    <dt className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Location</dt>
                    <dd className="mt-2 font-sans text-sm text-espresso">{location}</dd>
                  </div>
                )}

                <div>
                  <dt className="font-sans text-eyebrow font-semibold text-gold-ink uppercase">Admission</dt>
                  <dd className="mt-2 font-sans text-sm text-espresso">
                    {event.isPublic ? "Open to the public" : "Private event"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <ButtonLink href="/events" variant="text" arrow={false} className="text-stone hover:text-espresso">
                  ← Back to all events
                </ButtonLink>
              </div>
            </Reveal>
          </Container>
        </section>
      </article>

      {/* ── Invite CTA ── */}
      <section aria-labelledby="invite-cta-heading" className="bg-forest py-16 text-ivory">
        <Container className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="invite-cta-heading" className="font-display text-display-sm font-medium">
              Invite Natalie to your event
            </h2>
            <p className="mt-3 max-w-lg text-mist">
              Churches, ministries, organizations and event coordinators are welcome to submit an inquiry.
            </p>
          </div>
          <ButtonLink href="/contact" variant="inverse" arrow className="shrink-0">
            Submit a Booking Inquiry
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
