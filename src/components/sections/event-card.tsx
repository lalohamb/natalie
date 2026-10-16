import Link from "next/link";
import type { MinistryEvent } from "@/content/types";
import { cn } from "@/lib/cn";

const STATUS_LABELS: Record<MinistryEvent["status"], string> = {
  scheduled: "Upcoming",
  postponed: "Postponed",
  cancelled: "Cancelled",
  completed: "Past",
};

const STATUS_COLORS: Record<MinistryEvent["status"], string> = {
  scheduled: "text-forest bg-forest/10",
  postponed: "text-ember bg-ember/10",
  cancelled: "text-stone bg-sand",
  completed: "text-stone bg-sand",
};

const CATEGORY_LABELS: Record<MinistryEvent["category"], string> = {
  conference: "Conference",
  workshop: "Workshop",
  service: "Service",
  appearance: "Appearance",
  other: "Event",
};

function formatEventDate(startDate: string, endDate?: string, timeZone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  };
  const start = new Intl.DateTimeFormat("en-US", opts).format(new Date(startDate));
  if (!endDate) return start;
  const end = new Intl.DateTimeFormat("en-US", opts).format(new Date(endDate));
  return `${start} – ${end}`;
}

function formatEventTime(startDate: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(new Date(startDate));
}

type EventCardProps = {
  event: MinistryEvent;
  className?: string;
};

export function EventCard({ event, className }: EventCardProps) {
  const location = [event.venue, event.city, event.state].filter(Boolean).join(", ");

  return (
    <article
      aria-labelledby={`event-${event.id}`}
      className={cn(
        "group relative flex flex-col gap-4 border border-sand bg-ivory p-6 transition-shadow duration-300 hover:shadow-soft",
        className,
      )}
    >
      {/* Status + category */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-sm px-2.5 py-1 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.12em]",
            STATUS_COLORS[event.status],
          )}
        >
          {STATUS_LABELS[event.status]}
        </span>
        <span className="font-sans text-eyebrow text-stone">
          {CATEGORY_LABELS[event.category]}
        </span>
      </div>

      {/* Title */}
      <h3 id={`event-${event.id}`} className="font-display text-display-sm font-medium text-balance">
        <Link
          href={`/events/${event.slug}`}
          className="after:absolute after:inset-0 hover:text-ember"
        >
          {event.title}
        </Link>
      </h3>

      {/* Date + time */}
      <p className="font-sans text-sm font-semibold text-espresso">
        {formatEventDate(event.startDate, event.endDate, event.timeZone)}
        <span className="ml-3 font-normal text-stone">
          {formatEventTime(event.startDate, event.timeZone)}
        </span>
      </p>

      {/* Location */}
      {location && (
        <p className="text-sm text-stone">{location}</p>
      )}

      {/* Description excerpt */}
      <p className="line-clamp-2 text-sm text-pretty text-stone">{event.description}</p>

      {/* Registration link — rendered above the card overlay so it's clickable */}
      {event.registrationUrl && event.status === "scheduled" && (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-auto inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember"
        >
          Register
          <span className="sr-only"> for {event.title} (opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}
