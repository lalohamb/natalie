import type { StaticImageData } from "next/image";

/**
 * Content models. Pages read content through these types only, so the
 * typed-module source in `src/content/` can later be swapped for a CMS
 * without touching page or component code.
 */

export type ImageAsset = {
  src: StaticImageData;
  alt: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  platform: "instagram" | "facebook" | "youtube";
  label: string;
  href: string;
  /** Only verified links are rendered. See docs/reports/SITE-AUDIT.md §10. */
  verified: boolean;
};

export type CallToAction = {
  label: string;
  href: string;
};

/**
 * How a title can be bought today. `external` points at a live third-party or
 * legacy page; `none` renders no purchase button. A `checkout` variant will be
 * added once the commerce option is approved (IMPLEMENTATION-PLAN.md §5).
 */
export type PurchaseOption =
  | { kind: "external"; url: string; label: string }
  | { kind: "none" };

/** Publication state. `forthcoming` and `unavailable` suppress purchase UI. */
export type BookStatus = "published" | "forthcoming" | "unavailable";

// ---------------------------------------------------------------------------
// Ministry identity
// ---------------------------------------------------------------------------

export type MinistryPillar = {
  id: "equip" | "restore" | "activate";
  name: string;
  tagline: string;
  description: string;
  order: number;
};

export type MinistryIdentity = {
  /** Official ministry statement — display verbatim. */
  statement: string;
  pillars: MinistryPillar[];
};

export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  status: BookStatus;
  /** Verified price in USD cents. Omit when not sold on the site. */
  priceCents?: number;
  /** One or two sentences, drawn from the published description. */
  summary: string;
  /** Published description, preserved verbatim, one entry per paragraph. */
  description: string[];
  cover: ImageAsset;
  /** True when `cover` is a mockup rather than a flat front cover. */
  coverIsMockup?: boolean;
  forewordBy?: string;
  /** Unconfirmed offers (e.g. signed copies) stay null until the ministry confirms. */
  note?: string;
  companionOf?: string;
  purchase: PurchaseOption;
  featured: boolean;
  /** Used for tab filtering on the /books page. */
  category?: "prophetic" | "destiny" | "warfare" | "autobiography";
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventStatus = "scheduled" | "postponed" | "cancelled" | "completed";
export type EventCategory =
  | "conference"
  | "workshop"
  | "service"
  | "appearance"
  | "other";

export type MinistryEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** ISO 8601, e.g. "2027-03-15T10:00:00" */
  startDate: string;
  /** ISO 8601 */
  endDate?: string;
  /** IANA tz identifier, e.g. "America/Chicago" */
  timeZone: string;
  venue?: string;
  city: string;
  state?: string;
  country: string;
  isPublic: boolean;
  category: EventCategory;
  coverImage?: ImageAsset;
  registrationUrl?: string;
  status: EventStatus;
  /** false = draft; not rendered publicly */
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Google Calendar (public events calendar on /events)
// ---------------------------------------------------------------------------

/** A public-safe projection of a Google Calendar event — no attendees or private fields. */
export type CalendarEvent = {
  id: string;
  title: string;
  /** Plain text (HTML stripped). */
  description?: string;
  location?: string;
  allDay: boolean;
  /** All-day: "YYYY-MM-DD". Timed: ISO 8601 instant. */
  start: string;
  /** All-day: exclusive "YYYY-MM-DD". Timed: ISO 8601 instant. */
  end: string;
};

export type PublicCalendar = {
  /** IANA time zone of the calendar; events are displayed in this zone. */
  timeZone: string;
  events: CalendarEvent[];
  /** First month with loaded events, "YYYY-MM". */
  rangeStart: string;
  /** Last month with loaded events, "YYYY-MM". */
  rangeEnd: string;
  /** The current month in the calendar's time zone when the data was fetched, "YYYY-MM". */
  currentMonth: string;
};

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export type VideoCategory =
  | "ministry-message"
  | "biblical-teaching"
  | "interview"
  | "personal-reflection"
  | "event-highlight";

export type CuratedVideo = {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  /**
   * Public Facebook URL. Standard videos use facebook.com/[page]/videos/[id]/.
   * Reels use facebook.com/reel/[id]/. Reels cannot be reliably embedded;
   * set embeddable: false for Reels and render a link card instead.
   */
  facebookUrl?: string;
  /** Whether this URL supports iframe embedding (false for Reels). */
  embeddable: boolean;
  /**
   * URL of a self-hosted video file — either bundled in /public (e.g. "/Believe.mp4")
   * or uploaded through /admin (e.g. "/media-files/believe.mp4"). Takes priority over facebookUrl.
   */
  localSrc?: string;
  /** Optional poster image URL shown before a self-hosted video plays. */
  posterSrc?: string;
  /** 11-character YouTube video id. Used when there's no localSrc. */
  youtubeId?: string;
  thumbnailImage?: ImageAsset;
  /** One video may be featured on the homepage FeaturedMessage section. */
  featured: boolean;
  published: boolean;
  displayOrder: number;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Store products
// ---------------------------------------------------------------------------

export type ProductVariant = {
  size: string;
  color: string;
  /** false = do not render this variant */
  available: boolean;
};

export type Product = {
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  variants: ProductVariant[];
  /** Purchase destination — same pattern as Book.purchase */
  purchase: PurchaseOption;
  published: boolean;
};
