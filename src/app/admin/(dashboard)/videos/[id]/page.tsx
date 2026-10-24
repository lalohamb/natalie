import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { listFiles, readVideos } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { VideoForm } from "../../../_components/video-form";

export const metadata: Metadata = { title: "Edit video" };

// Video ids are only known at runtime, so the site header's `usePathname()`
// can't be prerendered here. Admin pages don't need instant navigation.
export const instant = false;

export default async function EditVideoPage({ params }: PageProps<"/admin/videos/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [videos, files] = await Promise.all([readVideos(), listFiles()]);
  const video = videos.find((v) => v.id === id);
  if (!video) notFound();

  return (
    <>
      <AdminPageHeader title="Edit video" description={video.title} />
      <VideoForm video={video} files={files} />
    </>
  );
}
