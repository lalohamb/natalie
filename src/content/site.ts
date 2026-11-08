import type { CallToAction, NavItem, SocialLink } from "./types";

export const site = {
  name: "Natalie Flemons Ministries",
  legalName: "Natalie Flemons Ministries",
  principal: "Natalie C. Flemons",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.natalieflemons.com",
  tagline: "Shaping Destinies. Advancing the Kingdom.",
  mission: "Leading people from their chaos to their call.",
  description:
    "Natalie C. Flemons is a spiritual midwife, prophet, intercessor, author and founder of Natalie Flemons Ministries — leading people from their chaos to their call.",
  email: "info@natalieflemons.com",
  locale: "en_US",
} as const;

export const mainNavigation: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Ministry", href: "/ministry" },
  { label: "Books", href: "/books" },
  { label: "Events", href: "/events" },
  { label: "Media", href: "/media" },
];

/** Secondary navigation rendered in the footer (not the main header). */
export const secondaryNavigation: NavItem[] = [
  { label: "Store", href: "/store" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Contact", href: "/contact" },
];

export const giveCta: CallToAction = { label: "Give", href: "/donate" };

export const legalNavigation: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
];

export const socialLinks: SocialLink[] = [
  {
    platform: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/natalie.flemons",
    verified: true,
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/natalieflemons",
    verified: true,
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@natalieflemons",
    verified: true,
  },
];

/** Existing, verified giving channels (legacy site /donate). */
export const giving = {
  stripeUrl: "https://donate.stripe.com/9AQaGHcs250e2R2aEE",
  cashAppHandle: "$NatalieFlemons",
  cashAppUrl: "https://cash.app/$NatalieFlemons",
  zelleEmail: "info@natalieflemons.com",
} as const;
