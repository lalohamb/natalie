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
  platform: "instagram" | "facebook";
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

export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
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
};
