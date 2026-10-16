import type { MinistryIdentity } from "./types";

/**
 * Authoritative ministry identity — approved M2 framework.
 * The official statement and three core pillars are the single source of truth.
 * Do not duplicate this text in component files.
 *
 * Supporting ministry subjects (Prayer, Prophecy, Purpose) are preserved in
 * home.ts and the Ministry page as teaching disciplines, not organizational pillars.
 */
export const ministryIdentity: MinistryIdentity = {
  statement:
    "Equipping believers to discern the voice of God. Restoring integrity in how they live, lead, and carry their calling. Activating them to walk fully in their purpose and advance the Kingdom of God.",
  pillars: [
    {
      id: "equip",
      name: "Equip",
      tagline: "Hear Clearly. Stand Firm. Walk Boldly.",
      description:
        "Equipping believers to discern the voice of God, develop spiritual maturity, and walk confidently in their Kingdom assignment.",
      order: 1,
    },
    {
      id: "restore",
      name: "Restore",
      tagline: "Purity in Character. Integrity in Calling. Excellence in Stewardship.",
      description:
        "Calling believers back to holiness, sound doctrine, and faithful stewardship of the gifts, callings and responsibilities entrusted to them.",
      order: 2,
    },
    {
      id: "activate",
      name: "Activate",
      tagline: "Awaken Purpose. Empowered for Impact. Positioned for Destiny.",
      description:
        "Activating believers to overcome spiritual barriers, embrace their God-given identity, and fulfill their divine purpose.",
      order: 3,
    },
  ],
};
