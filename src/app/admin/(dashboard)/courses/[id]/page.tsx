import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { readCourses } from "@/lib/course-store";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { CourseForm } from "../course-form";

export const metadata: Metadata = { title: "Edit Course" };
export const instant = false;

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [courses, files] = await Promise.all([readCourses(), listFiles()]);
  const course = courses.find((c) => c.id === id);
  if (!course) notFound();

  return (
    <>
      <AdminPageHeader title={`Edit: ${course.title}`} />
      <CourseForm course={course} files={files} />
    </>
  );
}
