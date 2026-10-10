import autumnPortrait from "@/assets/images/natalie-portrait-autumn.jpg";
import gardenPortrait from "@/assets/images/natalie-portrait-garden.jpg";
import type { ImageAsset } from "./types";

/**
 * Biography, preserved from the legacy About page. Light grammatical edits
 * ("a sought-after speaker") are pending ministry approval — see SITE-AUDIT.md §6.
 */
export const bio = {
  name: "Natalie C. Flemons",
  roles: ["Prophet", "Intercessor", "Author", "Speaker"],
  yearsInMinistry: "20+",
  short:
    "Natalie C. Flemons is a trailblazing spiritual midwife, pure Prophet of the Lord, powerful intercessor and founder of Natalie Flemons Ministries. With over 20 years of ministry experience, she has been instrumental in shaping destinies and empowering individuals and teams through the ministry of prayer and prophecy.",
  full: [
    "Natalie C. Flemons is a trailblazing spiritual midwife, pure Prophet of the Lord, powerful intercessor and founder of Natalie Flemons Ministries. With over 20 years of ministry experience, she has been instrumental in shaping destinies and empowering individuals and teams through the ministry of prayer and prophecy.",
    "Natalie is a sought-after speaker, spiritual advisor and builder of God’s Kingdom. She holds a Bachelor of Science in Nursing, Master of Health Services Administration degrees, and Certification for Case Management.",
    "She is married to the love of her life, Michael D. Flemons, and together they have an adoptive daughter, Sophia Naomi, affectionately known as Suddenly Sophia. Sophia is a product of the faithful prayers of Natalie as she warred and patiently awaited the Promise to be fulfilled.",
  ],
  speakingSummary:
    "Natalie is a sought-after speaker, spiritual advisor and builder of God’s Kingdom.",
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
