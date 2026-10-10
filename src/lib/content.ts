import { bio, portraits } from "@/content/bio";
import { books } from "@/content/books";
import { homeContent } from "@/content/home";
import { giving, giveCta, legalNavigation, mainNavigation, site, socialLinks } from "@/content/site";
import type { Book } from "@/content/types";

/*
 * Content accessors. Components import from here rather than from
 * `src/content/*` directly, so a CMS can replace these implementations later.
 */

export const getSite = () => site;
export const getNavigation = () => ({ main: mainNavigation, legal: legalNavigation, give: giveCta });
export const getSocialLinks = () => socialLinks.filter((link) => link.verified);
export const getGiving = () => giving;
export const getBio = () => bio;
export const getPortraits = () => portraits;
export const getHomeContent = () => homeContent;

export const getBooks = (): Book[] => books;
export const getFeaturedBooks = (): Book[] => books.filter((book) => book.featured);
export const getBook = (slug: string): Book | undefined => books.find((book) => book.slug === slug);
