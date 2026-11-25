import type { Product } from "./types";

/**
 * Merchandise shown on /store. Each product links out to the ministry's
 * Printify storefront, which owns the real catalog, prices, stock and orders;
 * the titles, prices and variants here are display copies.
 *
 * ⚠️  Hoodie sizes/colours were carried over from the legacy-site audit
 *     (2026-10-10) and have not been confirmed against Printify (G-41).
 */

export const products: Product[] = [
  {
    slug: "pray-hoodie",
    title: "Pray Hoodie",
    description:
      "\"Pray\" script with a heartbeat line and the tagline Spirit · Truth · Strategy. Available in Burnt Orange and Hunter Green.",
    priceCents: 5500,
    imageUrl: "https://images-api.printify.com/mockup/6af7abff413f1f5f200118de/32880/98424/white-hooded-sweatshirt.jpg?camera_label=front&revision=1794616543427&s=2048",
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
      url: "https://thereformcollective.printify.me/product/34401279",
      label: "Purchase",
    },
    published: true,
  },
  {
    slug: "pray-coffee-mug",
    title: "Pray Coffee Mug",
    description:
      "\"Pray\" script with a heartbeat line and the tagline Spirit · Truth · Strategy. A bold statement for your morning routine.",
    priceCents: 1999,
    imageUrl: "https://images-api.printify.com/mockup/6af7adc1dac4ab99400bbef1/72184/102752/pray-black-coffee-mug.jpg?camera_label=front&revision=1794617159910&s=2048",
    variants: [
      { size: "11oz", color: "Black", available: true },
    ],
    purchase: {
      kind: "external",
      url: "https://thereformcollective.printify.me/product/34401684",
      label: "Purchase",
    },
    published: true,
  },
];
