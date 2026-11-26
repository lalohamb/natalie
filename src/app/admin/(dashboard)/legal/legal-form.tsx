"use client";

import { startTransition, useActionState, useState } from "react";
import { saveLegal, type FormState } from "../../actions";
import { adminButton, adminInput, AdminPageHeader } from "../../_components/admin-ui";
import type { LegalData } from "@/lib/legal-store";

const initial: FormState = { status: "idle" };

const DOCS = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms of Use" },
] as const;

type DocKey = (typeof DOCS)[number]["key"];

export function LegalForm({ data }: { data: LegalData }) {
  const [state, action, pending] = useActionState(saveLegal, initial);
  const [activeDoc, setActiveDoc] = useState<DocKey>("privacy");

  const doc = data[activeDoc];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Doc switcher */}
      <div className="flex gap-1 rounded-sm border border-ivory/10 p-1 w-fit">
        {DOCS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDoc(key)}
            className={
              activeDoc === key
                ? "rounded-sm bg-ivory/10 px-4 py-1.5 font-sans text-xs font-semibold text-ivory"
                : "rounded-sm px-4 py-1.5 font-sans text-xs font-semibold text-mist hover:text-ivory"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <form
        key={activeDoc}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => action(formData));
        }}
        className="flex flex-col gap-8"
        noValidate
      >
        <input type="hidden" name="doc" value={activeDoc} />

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

        {/* Effective date */}
        <div>
          <label htmlFor="effectiveDate" className="mb-1.5 block font-sans text-xs font-semibold text-ivory">
            Effective date
          </label>
          <input
            id="effectiveDate"
            name="effectiveDate"
            defaultValue={doc.effectiveDate}
            maxLength={60}
            placeholder="e.g. January 1, 2025"
            className={`${adminInput} max-w-xs`}
          />
        </div>

        {/* Sections */}
        <div>
          <p className="mb-3 font-sans text-xs font-semibold text-ivory">
            Sections — separate paragraphs with a blank line.
          </p>
          <div className="flex flex-col gap-4">
            {doc.sections.map((section, i) => (
              <div key={i} className="rounded border border-ivory/10 bg-ivory/5 p-4">
                <input type="hidden" name={`section[${i}][heading]`} value={section.heading} />
                <p className="mb-2 font-sans text-xs font-semibold text-ivory">{section.heading}</p>
                <textarea
                  name={`section[${i}][paragraphs]`}
                  defaultValue={section.paragraphs.join("\n\n")}
                  rows={5}
                  required
                  className={adminInput}
                />
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
    </div>
  );
}
