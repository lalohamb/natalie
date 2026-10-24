import autumnPortrait from "@/assets/images/natalie-portrait-main.jpg";
import gardenPortrait from "@/assets/images/natalie-portrait-garden.jpg";
import type { ImageAsset } from "./types";

/**
 * Biography — updated from NF Bio 2026.docx (authoritative source, M2).
 * Sections map to the About page structure defined in M2 instructions.
 * Personal testimony is included as approved in the document.
 *
 * `full` is preserved for backward compatibility with BiographyPreview and
 * any component that reads bio.full directly.
 */
export const bio = {
  name: "Natalie C. Flemons",
  roles: ["Prophet", "Intercessor", "Author", "Speaker"],
  yearsInMinistry: "20+",

  /** Roles line from the 2026 biography header. */
  identityLine:
    "Trailblazing Spiritual Midwife. Author. Prophet of the Lord. Powerful Intercessor. Destiny Shaper.",

  /** Opening paragraph — used in BiographyPreview and About hero. */
  short:
    "Natalie C. Flemons is a trailblazing spiritual midwife, author, pure Prophet of the Lord, and powerful intercessor with a mandate to shape destinies and advance the Kingdom of God. With over 20 years of ministry experience, Natalie is passionate about equipping believers to hear the voice of God, restoring purity and integrity to prophetic ministry, and activating individuals to walk boldly in their God-given purpose.",

  speakingSummary:
    "Natalie is a sought-after speaker, spiritual advisor and builder of God's Kingdom.",

  /**
   * Full biography structured by section for the About page.
   * Source: NF Bio 2026.docx — do not paraphrase or reorder.
   */
  sections: {
    /** A. Introduction */
    introduction: [
      "Natalie C. Flemons is a trailblazing spiritual midwife, author, pure Prophet of the Lord, and powerful intercessor with a mandate to shape destinies and advance the Kingdom of God. With over 20 years of ministry experience, Natalie is passionate about equipping believers to hear the voice of God, restoring purity and integrity to prophetic ministry, and activating individuals to walk boldly in their God-given purpose.",
    ],

    /** B. Ministry Journey */
    ministryJourney: [
      "A native of Joliet, Illinois, a southwest suburb of Chicago, Natalie began her ministry journey in youth ministry, teaching, and mentoring before transitioning into leadership within prayer ministries. Throughout her journey, she has remained committed to developing people, cultivating spiritual maturity, and helping believers recognize and fulfill their Kingdom assignments.",
      "The Lord entrusted Natalie with the vision for Fertilizing Your Faith, a ministry originally established to serve individuals navigating the challenges of infertility. As its pioneer and leader for 12 years, Natalie ministered to those in the waiting season, providing spiritual encouragement and support through prayer and the Word of God. When the Lord declared that the season for Fertilizing Your Faith had come to an end, Natalie responded in obedience. In January 2024, she relaunched Natalie Flemons Ministries, embracing the next expression of her God-given assignment.",
      "Through Natalie Flemons Ministries, Natalie is dedicated to shaping destinies and empowering individuals and teams through the ministry of prayer and prophecy. Her mandate is reflected in three core pillars: EQUIP. RESTORE. ACTIVATE. She equips believers to discern the voice of God and walk in spiritual maturity; calls them back to purity in character, integrity in calling, and excellence in stewardship; and activates them to overcome spiritual barriers, embrace their God-given identity, and fulfill their divine purpose.",
    ],

    /** C. Leadership and Service */
    leadership: [
      "Natalie is an ordained Prophet and Elder under the leadership of Pastor Matthew Blumenberg at GO Church Chicago. She currently serves on the Pastoral Advising Team and as Executive Pastor over the Prayer and Prophetic Teams. In these leadership capacities, she helps develop and empower leaders, cultivate a culture of prayer, and strengthen the spiritual foundation of the local church.",
    ],

    /** D. Faith in the Marketplace */
    marketplace: [
      "Beyond the pulpit and ministry, Natalie holds a Bachelor of Science in Nursing and a Master of Health Services Administration, along with a certification in case management. She has served in the insurance industry as a Registered Nurse for over 20 years. Her commitment to advancing the Kingdom extends into the marketplace, where she has been instrumental in cultivating a culture of prayer among believers in the workplace. As part of her employer's Christian Professional Community leadership team, she helps create spaces where followers of Jesus can be uplifted and supported through prayer calls, Bible studies, and the sharing of testimonies.",
      "Natalie firmly believes that believers should never have to hide who they are in Christ. She is passionate about demonstrating that God can open doors in the marketplace for His light to shine, allowing faith and professional excellence to coexist as a powerful witness to His glory.",
    ],

    /** E. Personal Testimony — owner-controlled; display only approved content. */
    personalTestimony: [
      "Her personal testimony is woven into the very message she carries. Natalie is married to the love of her life, Michael D. Flemons, and together they have an adopted daughter, Sophia Naomi. Sophia is a living testimony of Natalie's faithful prayers as she warred in prayer and waited for the promise of motherhood to be fulfilled. Their story is a powerful reminder that the waiting season does not have to be the end of the story.",
    ],

    /** Closing paragraph from the biography. */
    closing: [
      "In addition to spending time with her family, Natalie enjoys traveling, mentoring, training, and preaching to advance the Kingdom of God. Whether through prayer, prophecy, writing, teaching, or leadership development, her heart remains steadfast: to equip believers, restore purity and integrity, and activate people to walk fully in their purpose and fulfill their Kingdom assignment.",
    ],
  },

  /**
   * Backward-compatible flat array for components that read bio.full.
   * Covers introduction → leadership → marketplace (first para) → testimony.
   */
  full: [
    "Natalie C. Flemons is a trailblazing spiritual midwife, author, pure Prophet of the Lord, and powerful intercessor with a mandate to shape destinies and advance the Kingdom of God. With over 20 years of ministry experience, Natalie is passionate about equipping believers to hear the voice of God, restoring purity and integrity to prophetic ministry, and activating individuals to walk boldly in their God-given purpose.",
    "Natalie is an ordained Prophet and Elder under the leadership of Pastor Matthew Blumenberg at GO Church Chicago. She currently serves on the Pastoral Advising Team and as Executive Pastor over the Prayer and Prophetic Teams. In these leadership capacities, she helps develop and empower leaders, cultivate a culture of prayer, and strengthen the spiritual foundation of the local church.",
    "Beyond the pulpit and ministry, Natalie holds a Bachelor of Science in Nursing and a Master of Health Services Administration, along with a certification in case management. She has served in the insurance industry as a Registered Nurse for over 20 years.",
    "Her personal testimony is woven into the very message she carries. Natalie is married to the love of her life, Michael D. Flemons, and together they have an adopted daughter, Sophia Naomi. Sophia is a living testimony of Natalie's faithful prayers as she warred in prayer and waited for the promise of motherhood to be fulfilled. Their story is a powerful reminder that the waiting season does not have to be the end of the story.",
  ],
} as const;

export const portraits = {
  autumn: {
    src: autumnPortrait,
    alt: "Natalie C. Flemons smiling with arms folded, wearing a burnt-orange sweater outdoors in autumn",
  },
  garden: {
    src: gardenPortrait,
    alt: "Natalie C. Flemons in a striped jacket, smiling in a sunlit garden beside a white gazebo",
  },
} satisfies Record<string, ImageAsset>;
