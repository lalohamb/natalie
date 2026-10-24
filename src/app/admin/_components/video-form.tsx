"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { VideoPlayer } from "@/components/media/video-player";
import { YouTubePlayer } from "@/components/media/youtube-player";
import type { CuratedVideo } from "@/content/types";
import type { MediaFile } from "@/lib/media-store";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";
import { lookupYouTube, saveVideo, type FormState } from "../actions";
import { CATEGORY_LABELS, adminButton, adminInput, formatBytes } from "./admin-ui";
import { FileUploader } from "./file-uploader";

const initial: FormState = { status: "idle" };

type VideoFormProps = {
  video?: CuratedVideo;
  files: MediaFile[];
};

export function VideoForm({ video, files: initialFiles }: VideoFormProps) {
  const [state, action, pending] = useActionState(saveVideo.bind(null, video?.id ?? null), initial);
  const [files, setFiles] = useState(initialFiles);
  const [sourceType, setSourceType] = useState<"file" | "youtube" | "facebook">(
    video?.youtubeId ? "youtube" : video && !video.localSrc && video.facebookUrl ? "facebook" : "file",
  );
  const [youtubeUrl, setYoutubeUrl] = useState(video?.youtubeId ? youTubeWatchUrl(video.youtubeId) : "");
  const [youtubeStatus, setYoutubeStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const youtubeId = parseYouTubeId(youtubeUrl);

  /** Validates the link with YouTube and fills an empty title with the video's own. */
  const checkYouTubeLink = async () => {
    if (!youtubeUrl.trim()) return setYoutubeStatus(null);
    const result = await lookupYouTube(youtubeUrl);
    if (result.status === "ok") {
      setYoutubeStatus({ ok: true, message: `“${result.title}”${result.author ? ` · ${result.author}` : ""}` });
      if (titleRef.current && !titleRef.current.value.trim()) titleRef.current.value = result.title.slice(0, 160);
    } else if (result.status === "error") {
      setYoutubeStatus({ ok: false, message: result.message });
    } else {
      setYoutubeStatus(null);
    }
  };
  const [localSrc, setLocalSrc] = useState(video?.localSrc ?? "");
  const [posterSrc, setPosterSrc] = useState(video?.posterSrc ?? "");

  const videoFiles = files.filter((f) => f.kind === "video");
  const imageFiles = files.filter((f) => f.kind === "image");
  const errors = state.fieldErrors ?? {};

  const onUploaded = (file: MediaFile) => {
    setFiles((prev) => [file, ...prev.filter((f) => f.url !== file.url)]);
    if (file.kind === "video") setLocalSrc(file.url);
    else setPosterSrc(file.url);
  };

  return (
    <form
      // Submit manually: a form `action` resets uncontrolled fields after every
      // submission, which would wipe the editor's input on a validation error.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="grid gap-8 lg:grid-cols-[1fr_22rem]"
      noValidate
    >
      <div className="flex flex-col gap-6">
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
            {state.message}
          </p>
        )}

        <Field label="Title" htmlFor="title" error={errors.title}>
          <input ref={titleRef} id="title" name="title" defaultValue={video?.title} required maxLength={160} className={adminInput} />
        </Field>

        <Field label="Description" htmlFor="description" hint="Optional. Shown under the video on the Media page." error={errors.description}>
          <textarea id="description" name="description" defaultValue={video?.description} rows={3} maxLength={2000} className={adminInput} />
        </Field>

        <Field label="Category" htmlFor="category" error={errors.category}>
          <select id="category" name="category" defaultValue={video?.category ?? "ministry-message"} className={adminInput}>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="rounded border border-ivory/10 p-5">
          <legend className="px-1 font-sans text-xs font-semibold text-ivory">Video source</legend>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ["file", "Video file (self-hosted)"],
                ["youtube", "YouTube link"],
                ["facebook", "Facebook URL"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 font-sans text-sm text-ivory">
                <input
                  type="radio"
                  name="sourceType"
                  value={value}
                  checked={sourceType === value}
                  onChange={() => setSourceType(value)}
                  className="accent-gold-light"
                />
                {label}
              </label>
            ))}
          </div>

          {sourceType === "file" ? (
            <div className="mt-5 flex flex-col gap-5">
              <Field label="Video file" htmlFor="localSrc" error={errors.localSrc}>
                <select
                  id="localSrc"
                  name="localSrc"
                  value={localSrc}
                  onChange={(e) => setLocalSrc(e.target.value)}
                  className={adminInput}
                >
                  <option value="">Choose a video…</option>
                  <FileOptions files={videoFiles} />
                </select>
              </Field>

              <Field label="Poster image" htmlFor="posterSrc" hint="Optional. Shown before playback starts." error={errors.posterSrc}>
                <select
                  id="posterSrc"
                  name="posterSrc"
                  value={posterSrc}
                  onChange={(e) => setPosterSrc(e.target.value)}
                  className={adminInput}
                >
                  <option value="">None — use the first frame</option>
                  <FileOptions files={imageFiles} />
                </select>
              </Field>

              <div>
                <p className="mb-2 font-sans text-xs font-semibold text-ivory">Upload a new file</p>
                <FileUploader compact onUploaded={onUploaded} />
              </div>
            </div>
          ) : sourceType === "youtube" ? (
            <div className="mt-5 flex flex-col gap-5">
              <Field
                label="YouTube video link"
                htmlFor="youtubeUrl"
                hint="Paste any link to the video — watch, youtu.be, Shorts or Live links all work. Unlisted videos are fine; private ones won't play."
                error={errors.youtubeUrl}
              >
                <input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => {
                    setYoutubeUrl(e.target.value);
                    setYoutubeStatus(null);
                  }}
                  onBlur={checkYouTubeLink}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className={adminInput}
                />
              </Field>
              {youtubeStatus && (
                <p
                  role={youtubeStatus.ok ? "status" : "alert"}
                  className={`-mt-3 flex items-start gap-1.5 font-sans text-xs ${youtubeStatus.ok ? "text-green-300" : "text-red-300"}`}
                >
                  {youtubeStatus.ok ? (
                    <CircleCheck aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
                  ) : (
                    <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
                  )}
                  {youtubeStatus.message}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5">
              <Field
                label="Facebook video URL"
                htmlFor="facebookUrl"
                hint="Reels (facebook.com/reel/…) can't be embedded — leave “Embed on site” unchecked to show a link card."
                error={errors.facebookUrl}
              >
                <input
                  id="facebookUrl"
                  name="facebookUrl"
                  type="url"
                  defaultValue={video?.facebookUrl}
                  placeholder="https://www.facebook.com/…/videos/…"
                  className={adminInput}
                />
              </Field>
              <Checkbox name="embeddable" label="Embed on site" defaultChecked={video?.embeddable ?? false} />
            </div>
          )}
        </fieldset>

        <div className="flex flex-col gap-3">
          <Checkbox name="published" label="Published — visible on the public Media page" defaultChecked={video?.published ?? true} />
          <Checkbox
            name="featured"
            label="Featured — show in the homepage Featured Message (replaces the current one)"
            defaultChecked={video?.featured ?? false}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className={adminButton.primary}>
            {pending ? "Saving…" : video ? "Save changes" : "Add video"}
          </button>
          <Link href="/admin/videos" className={adminButton.secondary}>
            Cancel
          </Link>
        </div>
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-2 font-sans text-xs font-semibold text-mist uppercase tracking-[0.12em]">Preview</p>
        {sourceType === "file" && localSrc ? (
          <VideoPlayer key={`${localSrc}|${posterSrc}`} src={localSrc} poster={posterSrc || undefined} title="Preview" />
        ) : sourceType === "youtube" && youtubeId ? (
          <YouTubePlayer key={youtubeId} videoId={youtubeId} title="Preview" />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded border border-ivory/10 bg-ivory/5 px-6 text-center font-sans text-xs text-mist">
            {sourceType === "file"
              ? "Choose a video file to preview it."
              : sourceType === "youtube"
                ? "Paste a YouTube link to preview it."
                : "Facebook videos are previewed on the public site."}
          </div>
        )}
      </aside>
    </form>
  );
}

function FileOptions({ files }: { files: MediaFile[] }) {
  const groups = [
    { label: "Uploaded", files: files.filter((f) => f.source === "upload") },
    { label: "Bundled with the site", files: files.filter((f) => f.source === "bundled") },
  ];
  return groups
    .filter((g) => g.files.length > 0)
    .map((g) => (
      <optgroup key={g.label} label={g.label}>
        {g.files.map((f) => (
          <option key={f.url} value={f.url}>
            {f.name} ({formatBytes(f.size)})
          </option>
        ))}
      </optgroup>
    ));
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-xs font-semibold text-ivory">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 font-sans text-xs text-mist">{hint}</p>}
      {error && (
        <p className="mt-1 font-sans text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-2.5 font-sans text-sm text-ivory">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-gold-light" />
      {label}
    </label>
  );
}
