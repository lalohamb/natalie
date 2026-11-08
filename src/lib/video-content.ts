import "server-only";

import { unstable_cache } from "next/cache";
import type { CuratedVideo } from "@/content/types";
import { readVideos } from "@/lib/media-store";

export const VIDEOS_CACHE_TAG = "videos";

const getCachedVideos = unstable_cache(
  async () => (await readVideos()).filter((v) => v.published),
  [VIDEOS_CACHE_TAG],
  { tags: [VIDEOS_CACHE_TAG] },
);

export async function getVideos(): Promise<CuratedVideo[]> {
  return getCachedVideos();
}

export async function getFeaturedVideo(): Promise<CuratedVideo | undefined> {
  return (await getVideos()).find((v) => v.featured);
}
