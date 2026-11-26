import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { readVideos } from "@/lib/media-store";
import { AdminPageHeader, CATEGORY_LABELS, StatusPill, adminButton } from "../../_components/admin-ui";
import { VideoRowActions } from "./video-row-actions";

export const metadata: Metadata = { title: "Videos" };
export const instant = false;

export default async function AdminVideosPage() {
  await requireAdmin();
  const videos = await readVideos();

  return (
    <>
      <AdminPageHeader
        title="Videos"
        description="Shown on the Media page in this order. Only published videos are public."
        actions={
          <Link href="/admin/videos/new" className={adminButton.primary}>
            Add video
          </Link>
        }
      />

      {videos.length === 0 ? (
        <div className="rounded border border-ivory/10 bg-ivory/5 px-6 py-12 text-center">
          <p className="font-sans text-sm text-mist">No videos yet.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2" role="list">
          {videos.map((video, index) => (
            <li
              key={video.id}
              className="flex flex-wrap items-center gap-4 rounded border border-ivory/10 bg-ivory/5 p-4"
            >
              <span className="w-6 text-center font-sans text-xs text-mist tabular-nums">{index + 1}</span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/videos/${video.id}`}
                    className="font-sans text-sm font-semibold text-ivory underline-offset-4 hover:underline"
                  >
                    {video.title}
                  </Link>
                  {video.published ? <StatusPill tone="green">Published</StatusPill> : <StatusPill tone="muted">Draft</StatusPill>}
                  {video.featured && <StatusPill tone="gold">Featured</StatusPill>}
                </div>
                <p className="mt-1 truncate font-sans text-xs text-mist">
                  {CATEGORY_LABELS[video.category]} ·{" "}
                  {video.localSrc ? (
                    <span className="font-mono">{video.localSrc}</span>
                  ) : video.youtubeId ? (
                    <>YouTube · <span className="font-mono">{video.youtubeId}</span></>
                  ) : (
                    <>Facebook{video.embeddable ? " (embedded)" : " (link)"}</>
                  )}
                </p>
              </div>

              <VideoRowActions
                id={video.id}
                title={video.title}
                published={video.published}
                featured={video.featured}
                isFirst={index === 0}
                isLast={index === videos.length - 1}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
