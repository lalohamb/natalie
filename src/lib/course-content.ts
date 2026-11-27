import "server-only";

import { cacheTag } from "next/cache";
import type { AdminCourse } from "@/content/types";
import { readCourses } from "@/lib/course-store";

export const COURSES_CACHE_TAG = "courses";

export async function getAdminCourses(): Promise<AdminCourse[]> {
  "use cache";
  cacheTag(COURSES_CACHE_TAG);
  return readCourses();
}

export async function getPublishedCourses(): Promise<AdminCourse[]> {
  return (await getAdminCourses()).filter((c) => c.status === "published");
}

export async function getAdminCourse(slug: string): Promise<AdminCourse | undefined> {
  return (await getAdminCourses()).find((c) => c.slug === slug);
}
