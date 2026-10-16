import type { Metadata } from "next";
import { getVideos } from "@/lib/content";
import { MediaPageClient } from "./media-page-client";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Video messages, biblical teachings, and ministry appearances from Natalie C. Flemons.",
  alternates: { canonical: "/media" },
  openGraph: { url: "/media" },
};

export default function MediaPage() {
  const videos = getVideos();
  return <MediaPageClient videos={videos} />;
}
