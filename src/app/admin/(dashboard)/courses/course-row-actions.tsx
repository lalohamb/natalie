"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { CourseStatus } from "@/content/types";
import { deleteCourse, setCoursesPublished } from "../../actions";
import { adminButton, StatusPill } from "../../_components/admin-ui";

const NEXT_STATUS: Record<CourseStatus, { next: CourseStatus; label: string }> = {
  published: { next: "draft", label: "Unpublish" },
  draft: { next: "published", label: "Publish" },
  "coming-soon": { next: "published", label: "Publish" },
};

export function CourseRowActions({ id, title, status }: { id: string; title: string; status: CourseStatus }) {
  const [pending, startTransition] = useTransition();
  const { next, label } = NEXT_STATUS[status];

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => startTransition(() => setCoursesPublished(id, next))}
        disabled={pending}
        className={`${adminButton.secondary} text-xs px-3`}
      >
        {label}
      </button>
      <Link href={`/admin/courses/${id}`} className={adminButton.icon} aria-label={`Edit ${title}`}>
        <Pencil className="size-4" strokeWidth={1.75} />
      </Link>
      <button
        onClick={() => {
          if (confirm(`Delete "${title}"? This cannot be undone.`)) {
            startTransition(() => deleteCourse(id));
          }
        }}
        disabled={pending}
        className={adminButton.danger}
        aria-label={`Delete ${title}`}
      >
        <Trash2 className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
