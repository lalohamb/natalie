import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { BookForm } from "../book-form";

export const metadata: Metadata = { title: "Add book" };
export const instant = false;

export default async function NewBookPage() {
  await requireAdmin();
  const files = await listFiles();
  return (
    <>
      <AdminPageHeader title="Add book" />
      <BookForm files={files} />
    </>
  );
}
