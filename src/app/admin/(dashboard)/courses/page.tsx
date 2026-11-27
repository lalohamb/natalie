import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { readCourses } from "@/lib/course-store";
import { AdminPageHeader, StatusPill, adminButton } from "../../_components/admin-ui";
import { CourseRowActions } from "./course-row-actions";

export const metadata: Metadata = { title: "Courses" };
export const instant = false;

const STATUS_TONE = {
  published: "green",
  draft: "muted",
  "coming-soon": "amber",
} as const;

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ added?: string }> }) {
  await requireAdmin();
  const [courses, { added }] = await Promise.all([readCourses(), searchParams]);

  return (
    <>
      <AdminPageHeader
        title="Courses"
        description="Build and manage online courses."
        actions={
          <Link href="/admin/courses/new" className={adminButton.primary}>
            Add course
          </Link>
        }
      />

      {added && (
        <p role="status" className="rounded border border-green-800/50 bg-green-950/40 px-4 py-3 font-sans text-sm text-green-300">
          Course added successfully.
        </p>
      )}

      {courses.length === 0 ? (
        <div className="rounded border border-ivory/10 bg-ivory/5 px-6 py-12 text-center">
          <p className="font-sans text-sm text-mist">No courses yet. Add your first course to get started.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2" role="list">
          {courses.map((course, index) => (
            <li key={course.id} className="flex flex-wrap items-center gap-4 rounded border border-ivory/10 bg-ivory/5 p-4">
              <span className="w-6 text-center font-sans text-xs text-mist tabular-nums">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-sans text-sm font-semibold text-ivory underline-offset-4 hover:underline"
                  >
                    {course.title}
                  </Link>
                  <StatusPill tone={STATUS_TONE[course.status]}>{course.status}</StatusPill>
                  {course.featured && <StatusPill tone="gold">Featured</StatusPill>}
                </div>
                <p className="mt-1 truncate font-sans text-xs text-mist">
                  {course.priceCents !== undefined ? `$${(course.priceCents / 100).toFixed(2)}` : "Free / external pricing"}
                  {course.enrollUrl ? ` · ${course.enrollUrl}` : " · No enrollment URL"}
                </p>
              </div>
              <CourseRowActions id={course.id} title={course.title} status={course.status} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
