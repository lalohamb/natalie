"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteBook, setBookPublished } from "../../actions";
import { adminButton } from "../../_components/admin-ui";
import type { BookStatus } from "@/content/types";

export function BookRowActions({ slug, title, status }: { slug: string; title: string; status: BookStatus }) {
  const [pending, startTransition] = useTransition();

  const toggleStatus = status === "published" ? "unavailable" : "published";
  const toggleLabel = status === "published" ? "Unpublish" : "Publish";

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={pending}
        onClick={() => startTransition(() => setBookPublished(slug, toggleStatus))}
        className={adminButton.secondary + " !min-h-8 !px-3 !text-[0.7rem]"}
      >
        {toggleLabel}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
          startTransition(() => deleteBook(slug));
        }}
        className={adminButton.danger}
        aria-label={`Delete ${title}`}
      >
        <Trash2 aria-hidden className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
