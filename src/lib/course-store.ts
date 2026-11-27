import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { z } from "zod";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";
import type { AdminCourse } from "@/content/types";

const MANIFEST_PATH = dataPath(STORAGE_DIR, "courses.json");
const FORMAT_VERSION = 1;

export const COURSE_STATUSES = ["published", "draft", "coming-soon"] as const;

const courseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  status: z.enum(COURSE_STATUSES),
  description: z.array(z.string()),
  summary: z.string(),
  coverUrl: z.string().optional(),
  coverAlt: z.string().optional(),
  priceCents: z.number().optional(),
  enrollUrl: z.string().optional(),
  enrollLabel: z.string().optional(),
  featured: z.boolean(),
  displayOrder: z.number(),
  createdAt: z.string(),
});

const manifestSchema = z.object({
  version: z.number().optional(),
  courses: z.array(courseSchema),
});

export function parseCourseManifest(raw: string): AdminCourse[] {
  return manifestSchema.parse(JSON.parse(raw)).courses.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function readCourses(): Promise<AdminCourse[]> {
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return parseCourseManifest(raw);
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateCourses<T>(mutate: (courses: AdminCourse[]) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const courses = await readCourses();
    const result = await mutate(courses);
    courses.sort((a, b) => a.displayOrder - b.displayOrder).forEach((c, i) => (c.displayOrder = i + 1));
    const manifest = { version: FORMAT_VERSION, courses };
    manifestSchema.parse(manifest);
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export const newCourseSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) + `-${randomUUID().slice(0, 4)}`;
