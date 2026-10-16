import type { Product } from "./types";

/**
 * Ministry store products verified on the legacy site on 2026-10-10
 * (SITE-AUDIT.md §5).
 *
 * Purchase links point at the live Squarespace product pages.
 * Replace when the commerce decision is made (IMPLEMENTATION-PLAN.md §5).
 *
 * ⚠️  No product images are available in src/assets/images/.
 *     Request clean per-color product photos from the ministry.
 * ⚠️  Stock levels are not tracked in this application.
 *     Variant availability reflects the audit snapshot (2026-10-10) only.
 */
const legacyStore = "https://www.natalieflemons.com";

export const products: Product[] = [
  {
    slug: "pray-hoodie",
    title: "Pray Hoodie",
    description:
      "\"Pray\" script with a heartbeat line and the tagline Spirit · Truth · Strategy. Available in Burnt Orange and Hunter Green.",
    priceCents: 5500,
    variants: [
      { size: "S", color: "Burnt Orange", available: true },
      { size: "M", color: "Burnt Orange", available: true },
      { size: "L", color: "Burnt Orange", available: true },
      { size: "XL", color: "Burnt Orange", available: true },
      { size: "2X", color: "Burnt Orange", available: true },
      { size: "3X", color: "Burnt Orange", available: true },
      { size: "S", color: "Hunter Green", available: true },
      { size: "M", color: "Hunter Green", available: true },
      { size: "L", color: "Hunter Green", available: true },
      { size: "XL", color: "Hunter Green", available: true },
      { size: "2X", color: "Hunter Green", available: true },
      { size: "3X", color: "Hunter Green", available: true },
    ],
    purchase: {
      kind: "external",
      url: `${legacyStore}/store-1/pray-hoodies`,
      label: "Purchase",
    },
    published: true,
  },
  {
    slug: "pray-t-shirt",
    title: "Pray T-Shirt",
    description:
      "\"Pray\" script with a heartbeat line and the tagline Spirit · Truth · Strategy. Available in Orange and Green.",
    priceCents: 2500,
    variants: [
      // ⚠️ Stock as of 2026-10-10 audit. Most variants were sold out.
      // Availability must be re-verified before launch.
      { size: "S", color: "Orange", available: false },
      { size: "M", color: "Orange", available: true },
      { size: "L", color: "Orange", available: false },
      { size: "XL", color: "Orange", available: true },
      { size: "2X", color: "Orange", available: true },
      { size: "3X", color: "Orange", available: true },
      { size: "S", color: "Green", available: false },
      { size: "M", color: "Green", available: false },
      { size: "L", color: "Green", available: true },
      { size: "XL", color: "Green", available: true },
      { size: "2X", color: "Green", available: true },
      { size: "3X", color: "Green", available: true },
    ],
    purchase: {
      kind: "external",
      url: `${legacyStore}/store-1/pray-t-shirts`,
      label: "Purchase",
    },
    published: true,
  },
];
