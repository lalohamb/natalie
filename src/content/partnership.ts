/**
 * Partnerships page messaging. The three statements (commitment, generosity,
 * investment) are ministry-supplied copy — keep them verbatim. They're split
 * into segments only so key phrases can be emphasised; joined, each reads
 * exactly as supplied.
 */

export type EmphasisSegment = { text: string; emphasis?: boolean };

export const partnershipContent = {
  why: {
    eyebrow: "Why Partner",
    heading: "Sowing into a Kingdom assignment",
    commitment: [
      { text: "Natalie Flemons Ministries is committed to " },
      { text: "equipping believers", emphasis: true },
      { text: ", " },
      { text: "restoring purity and integrity", emphasis: true },
      { text: ", and " },
      { text: "activating people to fulfill their God-given assignments", emphasis: true },
      { text: "." },
    ] satisfies EmphasisSegment[],
    cta: { label: "Explore the ministry pillars", href: "/ministry" },
  },

  supports: {
    eyebrow: "Your generosity supports",
    generosity:
      "Your generosity helps make this mission possible by supporting biblical teaching, prayer and prophetic ministry, leadership development, and resources that cultivate spiritual maturity and Kingdom impact.",
    items: [
      { id: "teaching", title: "Biblical teaching" },
      { id: "prayer", title: "Prayer & prophetic ministry" },
      { id: "leadership", title: "Leadership development" },
      { id: "resources", title: "Resources for spiritual maturity & Kingdom impact" },
    ],
  },

  investment: {
    eyebrow: "More Than a Gift",
    statement: [
      { text: "You are not simply giving to a ministry; you are " },
      { text: "investing", emphasis: true },
      { text: " in the development of people and the advancement of a Kingdom assignment." },
    ] satisfies EmphasisSegment[],
    cta: { label: "Become a Partner", href: "#giving" },
  },
} as const;
