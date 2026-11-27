"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import type { AdminCourse } from "@/content/types";
import type { MediaFile } from "@/lib/media-store";
import { saveCourse, type FormState } from "../../actions";
import { adminButton, adminInput } from "../../_components/admin-ui";
import { FileUploader } from "../../_components/file-uploader";

const initial: FormState = { status: "idle" };

const STATUS_LABELS = {
  published: "Published",
  draft: "Draft",
  "coming-soon": "Coming Soon",
};

export function CourseForm({ course, files: initialFiles }: { course?: AdminCourse; files: MediaFile[] }) {
  const [state, action, pending] = useActionState(saveCourse.bind(null, course?.id ?? null), initial);
  const [files, setFiles] = useState(initialFiles);
  const [coverUrl, setCoverUrl] = useState(course?.coverUrl ?? "");

  useEffect(() => {
    if (state.status !== "success") return;
    const t = setTimeout(() => { window.location.href = "/admin/courses"; }, 1200);
    return () => clearTimeout(t);
  }, [state.status]);

  const imageFiles = files.filter((f) => f.kind === "image");
  const errors = state.fieldErrors ?? {};

  const onUploaded = (file: MediaFile) => {
    setFiles((prev) => [file, ...prev.filter((f) => f.url !== file.url)]);
    if (file.kind === "image") setCoverUrl(file.url);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="flex flex-col gap-6 max-w-2xl"
      noValidate
    >
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p role="status" className="rounded border border-green-800/50 bg-green-950/40 px-4 py-3 font-sans text-sm text-green-300">
          {state.message} <Link href="/admin/courses" className="underline underline-offset-4 hover:text-ivory">Back to courses →</Link>
        </p>
      )}

      <Field label="Title" htmlFor="title" error={errors.title}>
        <input id="title" name="title" defaultValue={course?.title} required maxLength={160} className={adminInput} />
      </Field>

      <Field label="Subtitle" htmlFor="subtitle" hint="Optional.">
        <input id="subtitle" name="subtitle" defaultValue={course?.subtitle} maxLength={200} className={adminInput} />
      </Field>

      <Field label="Status" htmlFor="status" error={errors.status}>
        <select id="status" name="status" defaultValue={course?.status ?? "draft"} className={adminInput}>
          {(["published", "draft", "coming-soon"] as const).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </Field>

      <Field label="Summary" htmlFor="summary" hint="1–2 sentences shown on the listing page." error={errors.summary}>
        <textarea id="summary" name="summary" defaultValue={course?.summary} rows={2} maxLength={500} className={adminInput} />
      </Field>

      <Field label="Description" htmlFor="description" hint="Full description. Separate paragraphs with a blank line.">
        <textarea id="description" name="description" defaultValue={course?.description.join("\n\n")} rows={8} className={adminInput} />
      </Field>

      <Field label="Price (cents)" htmlFor="priceCents" hint="e.g. 9700 for $97.00. Leave blank if free or price is on the enrollment platform.">
        <input id="priceCents" name="priceCents" type="number" min={0} defaultValue={course?.priceCents} className={adminInput} />
      </Field>

      <Field label="Enrollment URL" htmlFor="enrollUrl" hint="Link to Teachable, Kajabi, or other platform.">
        <input id="enrollUrl" name="enrollUrl" type="url" defaultValue={course?.enrollUrl} className={adminInput} />
      </Field>

      <Field label="Enroll button label" htmlFor="enrollLabel" hint='Defaults to "Enroll Now".'>
        <input id="enrollLabel" name="enrollLabel" defaultValue={course?.enrollLabel} placeholder="Enroll Now" maxLength={60} className={adminInput} />
      </Field>

      {/* Cover image */}
      <fieldset className="rounded border border-ivory/10 p-5">
        <legend className="px-1 font-sans text-xs font-semibold text-ivory">Cover image</legend>
        <div className="flex flex-col gap-4">
          <Field label="Cover image URL" htmlFor="coverUrl" hint="Choose an uploaded image or paste a URL.">
            <select
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={`${adminInput} flex-1`}
            >
              <option value="">No cover</option>
              {imageFiles.map((f) => (
                <option key={f.url} value={f.url}>{f.name}</option>
              ))}
            </select>
            <input type="hidden" name="coverUrl" value={coverUrl} />
          </Field>

          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Cover preview" className="h-32 w-auto rounded border border-ivory/10 object-cover" />
          )}

          <Field label="Cover alt text" htmlFor="coverAlt" hint="Describe the image for screen readers.">
            <input id="coverAlt" name="coverAlt" defaultValue={course?.coverAlt} maxLength={300} className={adminInput} />
          </Field>

          <div>
            <p className="mb-2 font-sans text-xs font-semibold text-ivory">Upload a new cover</p>
            <FileUploader compact onUploaded={onUploaded} />
          </div>
        </div>
      </fieldset>

      <label className="flex items-start gap-2.5 font-sans text-sm text-ivory">
        <input type="checkbox" name="featured" defaultChecked={course?.featured ?? false} className="mt-0.5 size-4 accent-gold-light" />
        Featured — shown prominently on the courses page
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={adminButton.primary}>
          {pending ? "Saving…" : course ? "Save changes" : "Add course"}
        </button>
        <Link href="/admin/courses" className={adminButton.secondary}>Cancel</Link>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-xs font-semibold text-ivory">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 font-sans text-xs text-mist">{hint}</p>}
      {error && <p className="mt-1 font-sans text-xs text-red-300" role="alert">{error}</p>}
    </div>
  );
}
