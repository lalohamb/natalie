import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { readBooks } from "@/lib/book-store";
import { MAX_UPLOAD_BYTES, listFiles, readVideos, videosUsingUrl } from "@/lib/media-store";
import { AdminPageHeader, formatBytes } from "../../_components/admin-ui";
import { FileManager } from "./file-manager";

export const metadata: Metadata = { title: "Files" };
export const instant = false;

export default async function AdminFilesPage() {
  await requireAdmin();
  const [files, videos, books] = await Promise.all([listFiles(), readVideos(), readBooks()]);

  const rows = files.map((file) => ({
    ...file,
    usedBy: [
      ...videosUsingUrl(videos, file.url).map((v) => v.title),
      ...books.filter((b) => b.coverUrl === file.url).map((b) => b.title),
    ],
  }));

  return (
    <>
      <AdminPageHeader
        title="Files"
        description={`Video files, poster images and book covers. Uploads up to ${formatBytes(MAX_UPLOAD_BYTES)} each.`}
      />
      <FileManager files={rows} />
    </>
  );
}
