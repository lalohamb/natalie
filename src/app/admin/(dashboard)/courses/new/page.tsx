import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { CourseForm } from "../course-form";

export const metadata: Metadata = { title: "New Course" };
export const instant = false;

export default async function NewCoursePage() {
  await requireAdmin();
  const files = await listFiles();
  return (
    <>
      <AdminPageHeader title="New Course" />
      <CourseForm files={files} />
    </>
  );
}
