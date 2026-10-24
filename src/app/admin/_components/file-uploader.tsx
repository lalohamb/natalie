"use client";

import { useRef, useState } from "react";
import { CircleAlert, CircleCheck, Upload } from "lucide-react";
import type { MediaFile } from "@/lib/media-store";
import { cn } from "@/lib/cn";
import { formatBytes } from "./admin-ui";

const ACCEPT = ".mp4,.m4v,.webm,.mov,.jpg,.jpeg,.png,.webp,video/*,image/*";

type UploadItem = {
  key: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

/** Streams a file to the upload Route Handler with progress reporting. */
function uploadFile(file: File, onProgress: (fraction: number) => void) {
  return new Promise<MediaFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/files?name=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body: { file?: MediaFile; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body.file) resolve(body.file);
      else reject(new Error(body.error ?? `Upload failed (HTTP ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Network error — upload interrupted."));
    xhr.send(file);
  });
}

type FileUploaderProps = {
  onUploaded?: (file: MediaFile) => void;
  /** Restrict the picker, e.g. "video/*". */
  accept?: string;
  compact?: boolean;
};

export function FileUploader({ onUploaded, accept = ACCEPT, compact = false }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const update = (key: string, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const start = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      setItems((prev) => [...prev, { key, name: file.name, size: file.size, progress: 0, status: "uploading" }]);
      uploadFile(file, (progress) => update(key, { progress }))
        .then((uploaded) => {
          update(key, { status: "done", progress: 1, name: uploaded.name });
          onUploaded?.(uploaded);
        })
        .catch((err: Error) => update(key, { status: "error", error: err.message }));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          start(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded border border-dashed text-center transition-colors",
          compact ? "px-4 py-5" : "px-6 py-10",
          dragging ? "border-gold-light bg-gold/10" : "border-ivory/20 bg-ivory/5",
        )}
      >
        <Upload aria-hidden className="size-6 text-gold-light" strokeWidth={1.5} />
        <p className="font-sans text-sm text-mist">
          Drag files here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-gold-light underline underline-offset-4 hover:text-ivory"
          >
            choose files
          </button>
        </p>
        <p className="font-sans text-xs text-mist/80">MP4, WebM, MOV video · JPG, PNG, WebP poster images</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => start(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2" role="list" aria-live="polite">
          {items.map((item) => (
            <li key={item.key} className="rounded border border-ivory/10 bg-ivory/5 px-3 py-2">
              <div className="flex items-center justify-between gap-3 font-sans text-xs">
                <span className="truncate text-ivory">{item.name}</span>
                <span className="flex shrink-0 items-center gap-1.5 text-mist tabular-nums">
                  {item.status === "uploading" && `${Math.round(item.progress * 100)}% of ${formatBytes(item.size)}`}
                  {item.status === "done" && (
                    <>
                      <CircleCheck aria-hidden className="size-4 text-green-400" strokeWidth={1.75} /> Uploaded
                    </>
                  )}
                  {item.status === "error" && (
                    <>
                      <CircleAlert aria-hidden className="size-4 text-red-400" strokeWidth={1.75} /> Failed
                    </>
                  )}
                </span>
              </div>
              {item.status === "uploading" && (
                <div
                  className="mt-2 h-1 overflow-hidden rounded-full bg-ivory/10"
                  role="progressbar"
                  aria-label={`Uploading ${item.name}`}
                  aria-valuenow={Math.round(item.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full bg-gold-light transition-[width]" style={{ width: `${item.progress * 100}%` }} />
                </div>
              )}
              {item.error && <p className="mt-1 font-sans text-xs text-red-300">{item.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
