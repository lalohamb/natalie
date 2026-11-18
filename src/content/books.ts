import workbookMockup from "@/assets/images/cover-repair-the-breach-workbook-mockup.jpg";
import repairingTheBreachCover from "@/assets/images/cover-repairing-the-breach.jpg";
import midwifeCover from "@/assets/images/cover-the-midwife-to-your-destiny.jpg";
import warInTheWaitCover from "@/assets/images/cover-war-in-the-wait.png";
import fromthechaostothecall from "@/assets/images/cover-from-the-chaos-to-the-call.jpg";
import type { Book } from "./types";

/**
 * Books verified on the legacy site on 2026-10-10 (SITE-AUDIT.md §4).
 * "From the Chaos to the Call" added per ministry approval (Gate 2).
 *
 * Purchase links currently point at the live Squarespace product pages.
 * Replace them when the commerce decision is made (IMPLEMENTATION-PLAN.md §5).
 *
 * ⚠️ "From the Chaos to the Call" cover image not yet available.
 * Using repairingTheBreachCover as a temporary stand-in (coverIsMockup: true).
 * Replace with the actual cover when supplied by the ministry.
 */

const legacyStore = "https://www.natalieflemons.com";

export const books: Book[] = [
  {
    slug: "repairing-the-breach",
    title: "Repairing the Breach",
    subtitle: "Restoring Purity to the Prophetic",
    status: "published",
    priceCents: 1499,
    summary:
      "A clarion call to the authentic prophetic voices to restore the integrity of prophetic ministry in today's world — with a code of conduct rooted in the standards set by Christ, the Chief Prophet.",
    description: [
      "This manual was divinely written by Natalie C. Flemons as a clarion call to whom she describes as \u201cthe authentic\u201d prophetic voices, to restore the integrity of prophetic ministry in today\u2019s world. It challenges those called to the prophetic ministry to confront the cultural infiltration that has diluted its power and to righteously repair. Designed for emerging, mature, or inquiring prophets, this guide offers practical tools for personal and collective reformation. Natalie establishes a code of conduct, a framework for maintaining purity, rooted in the standards set by Christ, the Chief Prophet. Although the prophets lead this charge, every believer needs the divine revelation in this guide as arsenal against the enemy. Fulfilling the mandate to empower and equip believers to stand firm in this time of reformation by discerning falsehood and upholding the truth.",
    ],
    cover: {
      src: repairingTheBreachCover,
      alt: "Cover of Repairing the Breach: Restoring Purity to the Prophetic by Natalie C. Flemons, showing a roaring lion before a fiery brick wall",
    },
    forewordBy: "Matthew R. Blumenberg",
    stripeProductId: "prod_VeE111nQA2gFAw",
    purchase: {
      kind: "stripe-checkout",
      priceId: "price_1UcvZLHHr5ADDVu6bYcJFdpm",
      label: "Purchase",
    },
    featured: true,
    category: "prophetic",
  },
  {
    slug: "repair-the-breach-workbook",
    title: "Repair the Breach Workbook",
    subtitle: "A 3-Phase Journey to Prophetic Purity",
    status: "published",
    priceCents: 2500,
    summary:
      "A guided companion workbook that leads you through three transformative phases — Seek, Purge & Repair — rooted in the story of Josiah in 2 Chronicles 34.",
    description: [
      "Repair the Breach: 3-Phase Journey to Prophetic Purity is a guided companion workbook for those who are ready to examine, purify, and rebuild their prophetic lives according to God\u2019s pattern. Through teaching, reflection questions, practical assignments, activation prayers, and personal examination, you will be challenged to move beyond simply identifying what is broken and take responsibility for what God is calling you to repair. Rooted in the story of Josiah in 2 Chronicles 34, this workbook leads you through three transformative phases: SEEK, PURGE & REPAIR.",
      "Designed to be used alongside Repairing the Breach: Restoring Purity to the Prophetic, this workbook is not simply something to read\u2014it is a journey to walk through.",
    ],
    cover: {
      src: workbookMockup,
      alt: "Repair the Breach Workbook shown standing beside Repairing the Breach against a burnt-orange background",
    },
    coverIsMockup: true,
    companionOf: "repairing-the-breach",
    purchase: {
      kind: "external",
      url: `${legacyStore}/repair-the-breach-workbook/training`,
      label: "Purchase",
    },
    featured: true,
    category: "prophetic",
  },
  {
    slug: "the-midwife-to-your-destiny",
    title: "The Midwife To Your Destiny",
    subtitle: "A Guide to Living at Your Fullest Potential",
    status: "published",
    priceCents: 1499,
    summary:
      "A life-transforming guide that summons you to live at your fullest potential by confronting and conquering the enemies of your soul.",
    description: [
      "As you journey through this manual, you will experience the prophetic ministry of Natalie C. Flemons, as she speaks directly to your spirit and your soul. Those who are called to the ministry of the Midwife will be enlightened concerning their anatomy and challenged to carry their mantle with integrity. In addition, the person who is in search of destiny aka \u201cThe Destiny Seeker\u201d will learn how to be transparent with the spiritual midwife God sent into their life and receive complete deliverance; this process occurs as they are submitted to the Lord, and partner with the Holy Spirit. The midwife is yelling out, \u201cStranger Danger,\u201d to let the enemy know that you are not going to die. You are just being stretched to operate in your place of grace. This manual will graciously and with boldness summons you to live at your fullest potential by confronting and conquering the enemies of your soul. This life transforming guide is needed in every midwife\u2019s library! And to every person who is seeking someone to help them navigate through life\u2026 You need a Midwife!",
    ],
    cover: {
      src: midwifeCover,
      alt: "Cover of The Midwife To Your Destiny: A Guide to Living at Your Fullest Potential by Natalie C. Flemons, in teal with gold script",
    },
    forewordBy: "Louis C. Wimbley",
    purchase: {
      kind: "external",
      url: `${legacyStore}/the-midwife-to-your-destiny/guide`,
      label: "Purchase",
    },
    featured: true,
    category: "destiny",
  },
  {
    slug: "war-in-the-wait",
    title: "War In The Wait",
    status: "published",
    priceCents: 1499,
    summary:
      "The moment you realize you can no longer be friends with the enemy is when the war begins. A transparent journey of believing God for the miraculous.",
    description: [
      "The moment you realize you can no longer be friends with the enemy is when the war begins. You can no longer take a casual position, but you must take a position of a warrior; getting to your promise depends on it. In this book, Natalie takes you on a transparent journey of personal emotions and encounters while believing God for the miraculous. She effectively demonstrates how to use every spiritual weapon to counteract the battles that will inevitably come your way while you are waiting on the manifestation of God\u2019s promises. Once you have completed this book, you will have renewed hope and strength to embrace your process instead of rebuking it. The wisdom and prophetic insight of Natalie C. Flemons will cause every defeated and ungodly mentality to be dismantled and realigned with the mind of Christ.",
    ],
    cover: {
      src: warInTheWaitCover,
      alt: "Cover of War In The Wait by Natalie C. Flemons, in purple and gold with a sword above an embracing couple",
    },
    purchase: {
      kind: "external",
      url: `${legacyStore}/war-in-the-wait-1/book`,
      label: "Purchase",
    },
    featured: true,
    category: "warfare",
  },
  {
    slug: "from-the-chaos-to-the-call",
    title: "From the Chaos to the Call",
    status: "published",
    summary:
      "Natalie\u2019s autobiography \u2014 a personal journey from chaos to divine calling, available here.",
    description: [
      "From the Chaos to the Call is Natalie C. Flemons\u2019 autobiography, tracing her personal journey from life\u2019s deepest challenges to the clarity of her divine calling. Available now.",
    ],
    cover: {
      // ⚠️ No cover image available in src/assets/images/. Request from ministry.
      // Using a placeholder until the flat cover file is supplied.
      src: fromthechaostothecall,
      alt: "Cover of From the Chaos to the Call by Natalie C. Flemons",
    },
    purchase: {
      kind: "external",
      url: "",
      label: "BUY NOW",
    },
    featured: true,
    category: "autobiography",
  },
];
