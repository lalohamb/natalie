import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { VideoForm } from "../../../_components/video-form";

export const metadata: Metadata = { title: "Add video" };
export const instant = false;

export default async function NewVideoPage() {
  await requireAdmin();
  const files = await listFiles();

  return (
    <>
      <AdminPageHeader title="Add video" />
      <VideoForm files={files} />
    </>
  );
}
