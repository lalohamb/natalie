"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, Film, ImageIcon, Trash2 } from "lucide-react";
import type { MediaFile } from "@/lib/media-store";
import { deleteFile } from "../../actions";
import { StatusPill, adminButton, formatBytes } from "../../_components/admin-ui";
import { FileUploader } from "../../_components/file-uploader";

type FileRow = MediaFile & { usedBy: string[] };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export function FileManager({ files }: { files: FileRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "video" | "image">("all");

  const visible = filter === "all" ? files : files.filter((f) => f.kind === filter);

  const remove = (file: FileRow) => {
    if (!confirm(`Permanently delete ${file.name}? This can't be undone.`)) return;
    startTransition(async () => setNotice(await deleteFile(file.name)));
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    setNotice({ ok: true, message: "Link copied." });
  };

  return (
    <div className="flex flex-col gap-8">
      <FileUploader onUploaded={() => router.refresh()} />

      {notice && (
        <p
          role="status"
          className={`rounded border px-4 py-3 font-sans text-sm ${
            notice.ok ? "border-green-800/50 bg-green-950/40 text-green-300" : "border-red-800/50 bg-red-950/40 text-red-300"
          }`}
        >
          {notice.message}
        </p>
      )}

      <div>
        <div className="mb-3 flex gap-1" role="group" aria-label="Filter files">
          {(["all", "video", "image"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`min-h-9 rounded-sm px-3 font-sans text-xs font-semibold capitalize transition-colors ${
                filter === value ? "bg-ivory/10 text-ivory" : "text-mist hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              {value === "all" ? "All" : `${value}s`}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded border border-ivory/10 bg-ivory/5 px-6 py-12 text-center font-sans text-sm text-mist">
            No files yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-busy={pending}>
            {visible.map((file) => (
              <li key={file.url} className="flex flex-col overflow-hidden rounded border border-ivory/10 bg-ivory/5">
                <div className="relative aspect-video overflow-hidden bg-black">
                  {file.kind === "video" ? (
                    <video src={file.url} preload="metadata" muted controls className="absolute inset-0 h-full w-full object-contain" aria-label={file.name} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- runtime uploads aren't known to next/image at build
                    <img src={file.url} alt="" className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start gap-2">
                    {file.kind === "video" ? (
                      <Film aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    ) : (
                      <ImageIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-light" strokeWidth={1.75} />
                    )}
                    <p className="min-w-0 break-all font-sans text-sm font-semibold text-ivory">{file.name}</p>
                  </div>
                  <p className="font-sans text-xs text-mist tabular-nums">
                    {formatBytes(file.size)} · {dateFormat.format(new Date(file.modifiedAt))}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {file.source === "bundled" && <StatusPill tone="muted">Bundled</StatusPill>}
                    {file.usedBy.length > 0 ? (
                      <StatusPill tone="green">Used by {file.usedBy.length}</StatusPill>
                    ) : (
                      <StatusPill tone="amber">Unused</StatusPill>
                    )}
                  </div>
                  {file.usedBy.length > 0 && (
                    <p className="font-sans text-xs text-mist">{file.usedBy.map((t) => `“${t}”`).join(", ")}</p>
                  )}

                  <div className="mt-auto flex items-center gap-0.5 pt-2">
                    <button type="button" className={adminButton.icon} onClick={() => copyUrl(file.url)} aria-label={`Copy link to ${file.name}`} title="Copy link">
                      <Copy aria-hidden className="size-4" strokeWidth={1.75} />
                    </button>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className={adminButton.icon} aria-label={`Open ${file.name} in a new tab`} title="Open">
                      <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
                    </a>
                    {file.source === "upload" && (
                      <button
                        type="button"
                        className={`${adminButton.danger} ml-auto`}
                        disabled={pending || file.usedBy.length > 0}
                        onClick={() => remove(file)}
                        aria-label={`Delete ${file.name}`}
                        title={file.usedBy.length > 0 ? "In use — remove it from those videos or books first" : "Delete"}
                      >
                        <Trash2 aria-hidden className="size-4" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {files.some((f) => f.source === "bundled") && (
          <p className="mt-4 font-sans text-xs text-mist">
            Bundled files ship in the site’s <code className="font-mono">public/</code> folder and are managed in the code
            repository, so they can’t be deleted here.
          </p>
        )}
      </div>
    </div>
  );
}
