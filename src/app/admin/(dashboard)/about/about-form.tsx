"use client";

import { startTransition, useActionState, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { saveAbout, type FormState } from "../../actions";
import { adminButton, adminInput, AdminPageHeader } from "../../_components/admin-ui";
import type { AboutData } from "@/lib/about-store";
import type { MediaFile } from "@/lib/media-store";

const initial: FormState = { status: "idle" };

export function AboutForm({ data, imageFiles }: { data: AboutData; imageFiles: MediaFile[] }) {
  const [state, action, pending] = useActionState(saveAbout, initial);
  const [portraitUrl, setPortraitUrl] = useState(data.portraitUrl ?? "");
  const [tabs, setTabs] = useState(
    [...data.tabs].sort((a, b) => a.displayOrder - b.displayOrder),
  );

  const move = (index: number, dir: -1 | 1) => {
    const next = [...tabs];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setTabs(next);
  };

  const errors = state.fieldErrors ?? {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="flex flex-col gap-8 max-w-2xl"
      noValidate
    >
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded border border-red-800/50 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-300">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="rounded border border-green-800/50 bg-green-950/40 px-4 py-3 font-sans text-sm text-green-300">
          {state.message}
        </p>
      )}

      {/* ── Portrait ── */}
      <fieldset className="rounded border border-ivory/10 p-5">
        <legend className="px-1 font-sans text-xs font-semibold text-ivory">Portrait image</legend>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="portraitUrl" className="mb-1.5 block font-sans text-xs font-semibold text-ivory">
              Image
            </label>
            <select
              id="portraitUrl"
              name="portraitUrl"
              value={portraitUrl}
              onChange={(e) => setPortraitUrl(e.target.value)}
              className={adminInput}
            >
              <option value="">— use default portrait —</option>
              {imageFiles.map((f) => (
                <option key={f.url} value={f.url}>{f.name}</option>
              ))}
            </select>
            <p className="mt-1 font-sans text-xs text-mist">
              Upload images at{" "}
              <a href="/admin/files" className="underline underline-offset-2 hover:text-ivory">
                Files
              </a>
              , then select here.
            </p>
          </div>

          {portraitUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portraitUrl} alt="Portrait preview" className="h-40 w-auto rounded border border-ivory/10 object-cover" />
          )}

          <div>
            <label htmlFor="portraitAlt" className="mb-1.5 block font-sans text-xs font-semibold text-ivory">
              Alt text
            </label>
            <input
              id="portraitAlt"
              name="portraitAlt"
              defaultValue={data.portraitAlt ?? ""}
              maxLength={300}
              placeholder="Describe the portrait for screen readers"
              className={adminInput}
            />
            {errors.portraitAlt && (
              <p className="mt-1 font-sans text-xs text-red-300" role="alert">{errors.portraitAlt}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Tabs ── */}
      <div>
        <p className="mb-3 font-sans text-xs font-semibold text-ivory">
          Bio tabs — separate paragraphs with a blank line. Use ↑ ↓ to reorder.
        </p>
        <div className="flex flex-col gap-4">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="rounded border border-ivory/10 bg-ivory/5 p-4">
              {/* Hidden fields */}
              <input type="hidden" name={`tab[${index}][id]`} value={tab.id} />
              <input type="hidden" name={`tab[${index}][order]`} value={index + 1} />

              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${tab.label} up`}
                      className={adminButton.icon}
                    >
                      <ChevronUp aria-hidden className="size-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === tabs.length - 1}
                      aria-label={`Move ${tab.label} down`}
                      className={adminButton.icon}
                    >
                      <ChevronDown aria-hidden className="size-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  <span className="font-sans text-xs tabular-nums text-mist">{index + 1}</span>
                </div>

                <div className="flex-1">
                  <label htmlFor={`tab-label-${tab.id}`} className="mb-1 block font-sans text-xs font-semibold text-ivory">
                    Tab label
                  </label>
                  <input
                    id={`tab-label-${tab.id}`}
                    name={`tab[${index}][label]`}
                    defaultValue={tab.label}
                    maxLength={40}
                    required
                    className={adminInput}
                  />
                  {errors[`tabs.${index}.label`] && (
                    <p className="mt-1 font-sans text-xs text-red-300">{errors[`tabs.${index}.label`]}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor={`tab-paragraphs-${tab.id}`} className="mb-1 block font-sans text-xs font-semibold text-ivory">
                  Content
                </label>
                <textarea
                  id={`tab-paragraphs-${tab.id}`}
                  name={`tab[${index}][paragraphs]`}
                  defaultValue={tab.paragraphs.join("\n\n")}
                  rows={6}
                  required
                  className={adminInput}
                />
                {errors[`tabs.${index}.paragraphs`] && (
                  <p className="mt-1 font-sans text-xs text-red-300">{errors[`tabs.${index}.paragraphs`]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <button type="submit" disabled={pending} className={adminButton.primary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
