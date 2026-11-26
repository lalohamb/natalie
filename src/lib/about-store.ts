import "server-only";

import fs from "node:fs/promises";
import { cacheTag } from "next/cache";
import { z } from "zod";
import { bio } from "@/content/bio";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";

const MANIFEST_PATH = dataPath(STORAGE_DIR, "about.json");

export const ABOUT_CACHE_TAG = "about";

const tabSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(40),
  paragraphs: z.array(z.string().min(1)),
  displayOrder: z.number().int(),
});

const aboutSchema = z.object({
  portraitUrl: z.string().optional(),
  portraitAlt: z.string().max(300).optional(),
  tabs: z.array(tabSchema),
});

export type AboutTab = z.infer<typeof tabSchema>;
export type AboutData = z.infer<typeof aboutSchema>;

function seed(): AboutData {
  return {
    portraitUrl: undefined,
    portraitAlt: bio.sections.introduction[0] ? undefined : undefined,
    tabs: [
      { id: "journey",     label: "Ministry",     paragraphs: [...bio.sections.ministryJourney],                                    displayOrder: 1 },
      { id: "leadership",  label: "Leadership",   paragraphs: [...bio.sections.leadership],                                         displayOrder: 2 },
      { id: "marketplace", label: "Professional", paragraphs: [...bio.sections.marketplace],                                        displayOrder: 3 },
      { id: "testimony",   label: "Testimony",    paragraphs: [...bio.sections.personalTestimony, ...bio.sections.closing],         displayOrder: 4 },
      { id: "story",       label: "My Story",     paragraphs: ["Natalie\u2019s autobiography traces her personal journey from life\u2019s deepest challenges to the clarity of her divine calling. The complete narrative is available in her book \u2014 From the Chaos to the Call."], displayOrder: 5 },
    ],
  };
}

export async function readAbout(): Promise<AboutData> {
  "use cache";
  cacheTag(ABOUT_CACHE_TAG);
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return seed();
    throw err;
  }
  return aboutSchema.parse(JSON.parse(raw));
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateAbout(mutate: (data: AboutData) => void): Promise<void> {
  const run = writeQueue.then(async () => {
    const data = await readAbout();
    mutate(data);
    data.tabs.sort((a, b) => a.displayOrder - b.displayOrder).forEach((t, i) => (t.displayOrder = i + 1));
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(aboutSchema.parse(data), null, 2) + "\n");
  });
  writeQueue = run.catch(() => {});
  return run;
}
