import { bio, portraits } from "@/content/bio";
import { homeContent } from "@/content/home";
import { ministryIdentity } from "@/content/ministry-identity";
import { partnershipContent } from "@/content/partnership";
import { products } from "@/content/products";
import { STORE_URL, giveCta, legalNavigation, mainNavigation, secondaryNavigation, site, socialLinks } from "@/content/site";
import type { MinistryIdentity, Product } from "@/content/types";

/*
 * Content accessors. Components import from here rather than from
 * `src/content/*` directly, so a CMS can replace these implementations later.
 * getGiving() is in @/lib/giving (server-only — not exported from here).
 */

// Site
export const getSite = () => site;
export const getNavigation = () => ({ main: mainNavigation, secondary: secondaryNavigation, legal: legalNavigation, give: giveCta });
export const getSocialLinks = () => socialLinks.filter((link) => link.verified);
/** External storefront every "Store" link points at. */
export const getStoreUrl = () => STORE_URL;

// Bio
export const getBio = () => bio;
export const getPortraits = () => portraits;

// Ministry identity
export const getMinistryIdentity = (): MinistryIdentity => ministryIdentity;

// Content
export const getHomeContent = () => homeContent;
export const getPartnershipContent = () => partnershipContent;

// Books — server-only. Import from @/lib/book-content directly in server components.

// Media — videos are admin-managed at runtime; see `lib/video-content.ts`.

// Products
export const getProducts = (): Product[] => products.filter((p) => p.published);
export const getProduct = (slug: string): Product | undefined =>
  getProducts().find((p) => p.slug === slug);
