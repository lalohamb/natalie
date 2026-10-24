"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Star, Trash2 } from "lucide-react";
import { deleteVideo, moveVideo, setVideoFeatured, setVideoPublished } from "../../actions";
import { adminButton } from "../../_components/admin-ui";
import { cn } from "@/lib/cn";

type VideoRowActionsProps = {
  id: string;
  title: string;
  published: boolean;
  featured: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export function VideoRowActions({ id, title, published, featured, isFirst, isLast }: VideoRowActionsProps) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>) => startTransition(async () => void (await fn()));

  return (
    <div className={cn("flex items-center gap-0.5", pending && "opacity-60")} aria-busy={pending}>
      <button
        type="button"
        className={adminButton.icon}
        disabled={pending || isFirst}
        onClick={() => run(() => moveVideo(id, "up"))}
        aria-label={`Move “${title}” up`}
        title="Move up"
      >
        <ArrowUp aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className={adminButton.icon}
        disabled={pending || isLast}
        onClick={() => run(() => moveVideo(id, "down"))}
        aria-label={`Move “${title}” down`}
        title="Move down"
      >
        <ArrowDown aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className={adminButton.icon}
        disabled={pending}
        onClick={() => run(() => setVideoPublished(id, !published))}
        aria-label={published ? `Unpublish “${title}”` : `Publish “${title}”`}
        title={published ? "Unpublish" : "Publish"}
      >
        {published ? (
          <Eye aria-hidden className="size-4" strokeWidth={1.75} />
        ) : (
          <EyeOff aria-hidden className="size-4" strokeWidth={1.75} />
        )}
      </button>
      <button
        type="button"
        className={cn(adminButton.icon, featured && "text-gold-light")}
        disabled={pending}
        onClick={() => run(() => setVideoFeatured(id, !featured))}
        aria-label={featured ? `Remove “${title}” from homepage` : `Feature “${title}” on homepage`}
        aria-pressed={featured}
        title={featured ? "Featured on homepage" : "Feature on homepage"}
      >
        <Star aria-hidden className={cn("size-4", featured && "fill-gold-light")} strokeWidth={1.75} />
      </button>
      <Link href={`/admin/videos/${id}`} className={adminButton.icon} aria-label={`Edit “${title}”`} title="Edit">
        <Pencil aria-hidden className="size-4" strokeWidth={1.75} />
      </Link>
      <button
        type="button"
        className={adminButton.danger}
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete “${title}”? The video file stays in the Files library.`)) run(() => deleteVideo(id));
        }}
        aria-label={`Delete “${title}”`}
        title="Delete"
      >
        <Trash2 aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
