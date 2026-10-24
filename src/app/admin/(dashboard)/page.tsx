import type { Metadata } from "next";
import Link from "next/link";
import { Film, FolderOpen, Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { listFiles, readVideos } from "@/lib/media-store";
import { AdminPageHeader, adminButton, formatBytes } from "../_components/admin-ui";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [videos, files] = await Promise.all([readVideos(), listFiles()]);

  const published = videos.filter((v) => v.published).length;
  const featured = videos.find((v) => v.featured);
  const uploads = files.filter((f) => f.source === "upload");
  const storageUsed = uploads.reduce((sum, f) => sum + f.size, 0);

  const stats = [
    { label: "Videos", value: String(videos.length), detail: `${published} published · ${videos.length - published} draft` },
    { label: "Media files", value: String(files.length), detail: `${uploads.length} uploaded · ${files.length - uploads.length} bundled` },
    { label: "Upload storage", value: formatBytes(storageUsed), detail: "Uploaded files only" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Manage the videos shown on the Media page and the homepage Featured Message."
        actions={
          <>
            <Link href="/admin/videos/new" className={adminButton.primary}>
              Add video
            </Link>
            <Link href="/admin/files" className={adminButton.secondary}>
              Upload files
            </Link>
          </>
        }
      />

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded border border-ivory/10 bg-ivory/5 p-5">
            <dt className="font-sans text-xs font-semibold text-mist uppercase tracking-[0.12em]">{stat.label}</dt>
            <dd className="mt-2 font-display text-3xl font-medium text-ivory tabular-nums">{stat.value}</dd>
            <dd className="mt-1 font-sans text-xs text-mist">{stat.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/admin/videos" className="group rounded border border-ivory/10 p-5 transition-colors hover:border-gold/50 hover:bg-ivory/5">
          <Film aria-hidden className="size-5 text-gold-light" strokeWidth={1.75} />
          <h2 className="mt-3 font-sans text-sm font-semibold text-ivory">Videos</h2>
          <p className="mt-1 font-sans text-xs text-mist">Add, edit, reorder, publish or unpublish videos.</p>
        </Link>
        <Link href="/admin/files" className="group rounded border border-ivory/10 p-5 transition-colors hover:border-gold/50 hover:bg-ivory/5">
          <FolderOpen aria-hidden className="size-5 text-gold-light" strokeWidth={1.75} />
          <h2 className="mt-3 font-sans text-sm font-semibold text-ivory">Files</h2>
          <p className="mt-1 font-sans text-xs text-mist">Upload video files and poster images, or remove unused ones.</p>
        </Link>
        <div className="rounded border border-ivory/10 p-5">
          <Star aria-hidden className="size-5 text-gold-light" strokeWidth={1.75} />
          <h2 className="mt-3 font-sans text-sm font-semibold text-ivory">Featured on homepage</h2>
          <p className="mt-1 font-sans text-xs text-mist">
            {featured ? (
              <>
                “{featured.title}”{!featured.published && " — unpublished, so not shown"}
              </>
            ) : (
              "None — the Featured Message section is hidden."
            )}
          </p>
        </div>
      </div>
    </>
  );
}
