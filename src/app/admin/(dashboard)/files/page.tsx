import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { MAX_UPLOAD_BYTES, listFiles, readVideos, videosUsingUrl } from "@/lib/media-store";
import { AdminPageHeader, formatBytes } from "../../_components/admin-ui";
import { FileManager } from "./file-manager";

export const metadata: Metadata = { title: "Files" };

export default async function AdminFilesPage() {
  await requireAdmin();
  const [files, videos] = await Promise.all([listFiles(), readVideos()]);

  const rows = files.map((file) => ({
    ...file,
    usedBy: videosUsingUrl(videos, file.url).map((v) => v.title),
  }));

  return (
    <>
      <AdminPageHeader
        title="Files"
        description={`Video files and poster images. Uploads up to ${formatBytes(MAX_UPLOAD_BYTES)} each.`}
      />
      <FileManager files={rows} />
    </>
  );
}
