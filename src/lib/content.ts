import { bio, portraits } from "@/content/bio";
import { events } from "@/content/events";
import { homeContent } from "@/content/home";
import { ministryIdentity } from "@/content/ministry-identity";
import { partnershipContent } from "@/content/partnership";
import { products } from "@/content/products";
import { giveCta, legalNavigation, mainNavigation, secondaryNavigation, site, socialLinks } from "@/content/site";
import type { MinistryEvent, MinistryIdentity, Product } from "@/content/types";

/*
 * Content accessors. Components import from here rather than from
 * `src/content/*` directly, so a CMS can replace these implementations later.
 * getGiving() is in @/lib/giving (server-only — not exported from here).
 */

// Site
export const getSite = () => site;
export const getNavigation = () => ({ main: mainNavigation, secondary: secondaryNavigation, legal: legalNavigation, give: giveCta });
export const getSocialLinks = () => socialLinks.filter((link) => link.verified);

// Bio
export const getBio = () => bio;
export const getPortraits = () => portraits;

// Ministry identity
export const getMinistryIdentity = (): MinistryIdentity => ministryIdentity;

// Content
export const getHomeContent = () => homeContent;
export const getPartnershipContent = () => partnershipContent;

// Books — server-only. Import from @/lib/book-content directly in server components.

// Events
export const getEvents = (): MinistryEvent[] => events.filter((e) => e.published);
export const getUpcomingEvents = (n = 3): MinistryEvent[] =>
  getEvents()
    .filter((e) => e.status === "scheduled" && new Date(e.startDate) >= new Date())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, n);
export const getEventsByYear = (year: number): MinistryEvent[] =>
  getEvents().filter((e) => new Date(e.startDate).getFullYear() === year);
export const getEventsByMonth = (year: number, month: number): MinistryEvent[] =>
  getEvents().filter((e) => {
    const d = new Date(e.startDate);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
export const getEvent = (slug: string): MinistryEvent | undefined =>
  getEvents().find((e) => e.slug === slug);

// Media — videos are admin-managed at runtime; see `lib/video-content.ts`.

// Products
export const getProducts = (): Product[] => products.filter((p) => p.published);
export const getProduct = (slug: string): Product | undefined =>
  getProducts().find((p) => p.slug === slug);
