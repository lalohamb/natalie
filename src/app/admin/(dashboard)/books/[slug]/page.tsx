import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { readBooks } from "@/lib/book-store";
import { listFiles } from "@/lib/media-store";
import { AdminPageHeader } from "../../../_components/admin-ui";
import { BookForm } from "../book-form";

type Props = { params: Promise<{ slug: string }> };

// cacheComponents requires at least one static param. "_" is a placeholder
// that hits notFound() at runtime — real slugs are resolved dynamically.
export function generateStaticParams() { return [{ slug: "_" }]; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const books = await readBooks();
  const book = books.find((b) => b.slug === slug);
  return { title: book ? `Edit: ${book.title}` : "Edit book" };
}

export default async function EditBookPage({ params }: Props) {
  await requireAdmin();
  const { slug } = await params;
  const [books, files] = await Promise.all([readBooks(), listFiles()]);
  const book = books.find((b) => b.slug === slug);
  if (!book) notFound();

  return (
    <>
      <AdminPageHeader title={`Edit: ${book.title}`} />
      <BookForm book={book} files={files} />
    </>
  );
}
