import "server-only";

import { cacheTag } from "next/cache";
import type { CuratedVideo } from "@/content/types";
import { readVideos } from "@/lib/media-store";

/*
 * Video accessors. Videos are managed from /admin at runtime, so — unlike the
 * static accessors in `lib/content.ts` — these read the media store and are
 * cached under the `videos` tag, which admin actions expire on every change.
 */

export const VIDEOS_CACHE_TAG = "videos";

export async function getVideos(): Promise<CuratedVideo[]> {
  "use cache";
  cacheTag(VIDEOS_CACHE_TAG);
  const videos = await readVideos();
  return videos.filter((v) => v.published);
}

export async function getFeaturedVideo(): Promise<CuratedVideo | undefined> {
  return (await getVideos()).find((v) => v.featured);
}
