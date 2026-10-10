import type { CallToAction } from "./types";

/**
 * Homepage messaging. Every statement here is drawn from published ministry
 * copy (legacy site, book descriptions, or the About bio). Do not add programs,
 * events, testimonials or credentials that the ministry has not supplied.
 */
export const homeContent = {
  hero: {
    eyebrow: "Natalie Flemons Ministries",
    headline: ["The Midwife", "To Your", "Destiny"],
    supporting: "Leading people from their chaos to their call.",
    primaryCta: { label: "Meet Natalie", href: "/about" },
    secondaryCta: { label: "Explore the Books", href: "/books" },
    tertiaryCta: { label: "Invite Natalie to Speak", href: "/booking" },
  },

  introduction: {
    eyebrow: "Meet Natalie",
    heading: "Shaping destinies through prayer and prophecy",
    cta: { label: "Read her story", href: "/about" } satisfies CallToAction,
  },

  message: {
    eyebrow: "The Ministry",
    heading: "From the chaos to the call",
    lede: "Natalie’s ministry exists to help believers discern the voice of God, carry their mantle with integrity, and step fully into the destiny He has prepared.",
    pillars: [
      {
        title: "Prayer",
        // Bio: "powerful intercessor"; War In The Wait: "every spiritual weapon"
        body: "As a powerful intercessor, Natalie teaches believers to take the position of a warrior — using every spiritual weapon while waiting on the manifestation of God’s promises.",
      },
      {
        title: "Prophecy",
        // Repairing the Breach description
        body: "A call to restore the integrity of prophetic ministry — discerning falsehood, upholding the truth, and maintaining purity rooted in the standards set by Christ, the Chief Prophet.",
      },
      {
        title: "Purpose",
        // The Midwife To Your Destiny description
        body: "As a spiritual midwife, Natalie helps destiny seekers confront the enemies of their soul and live at their fullest potential, stretched to operate in their place of grace.",
      },
    ],
  },

  publications: {
    eyebrow: "Publications",
    heading: "Books by Natalie C. Flemons",
    lede: "Manuals and guides written to equip believers for purity, perseverance and purpose.",
    cta: { label: "View all books", href: "/books" } satisfies CallToAction,
  },

  booking: {
    eyebrow: "Speaking & Ministry",
    heading: "Invite Natalie",
    body: "Natalie is a sought-after speaker, spiritual advisor and builder of God’s Kingdom. Churches, ministries, organizations and event coordinators are invited to share the details of their gathering.",
    cta: { label: "Submit a Booking Inquiry", href: "/booking" } satisfies CallToAction,
  },

  partner: {
    eyebrow: "Partner With the Ministry",
    heading: "Partner With the Vision",
    body: "Thank you for sowing into Natalie Flemons Ministries. Your partnership helps carry this message forward. You are sowing into good ground — may the Lord bless and prosper you.",
    cta: { label: "Give Today", href: "/donate" } satisfies CallToAction,
  },

  newsletter: {
    eyebrow: "Stay Connected",
    heading: "News & updates from the ministry",
    body: "Sign up with your email address to receive ministry news, updates and announcements.",
  },
} as const;
