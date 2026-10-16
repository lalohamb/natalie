import type { CuratedVideo } from "./types";

/**
 * Curated video content for the /media page and homepage FeaturedMessage.
 *
 * ⚠️  The supplied URL https://www.facebook.com/reel/27601806466164022 is a
 * Facebook Reel. Reels use a different URL structure from standard Facebook
 * videos and cannot be reliably embedded via iframe. It is stored here with
 * embeddable: false and will render as a "Watch on Facebook" link card.
 *
 * To enable the full user-initiated embed experience, supply a standard
 * Facebook video URL in the form:
 *   https://www.facebook.com/[page]/videos/[video-id]/
 * and set embeddable: true on that entry.
 *
 * Only one video may have featured: true (used by the homepage FeaturedMessage).
 * published: false entries are never rendered publicly.
 */
export const videos: CuratedVideo[] = [
  {
    id: "v-001",
    title: "When God Had to Interrupt Me",
    description: "A personal message from Natalie C. Flemons.",
    category: "ministry-message",
    facebookUrl: "https://www.facebook.com/reel/27601806466164022",
    embeddable: false,
    featured: true,
    published: true,
    displayOrder: 1,
    createdAt: "2027-01-01T00:00:00",
  },
];
