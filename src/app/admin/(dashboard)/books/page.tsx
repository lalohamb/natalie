import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { readBooks } from "@/lib/book-store";
import { AdminPageHeader, StatusPill, adminButton } from "../../_components/admin-ui";
import { BookRowActions } from "./book-row-actions";

export const metadata: Metadata = { title: "Books" };
export const instant = false;

const STATUS_TONE = {
  published: "green",
  forthcoming: "amber",
  unavailable: "muted",
} as const;

export default async function AdminBooksPage() {
  await requireAdmin();
  const books = await readBooks();

  return (
    <>
      <AdminPageHeader
        title="Books"
        description="Manage published books and their Stripe checkout links."
        actions={
          <Link href="/admin/books/new" className={adminButton.primary}>
            Add book
          </Link>
        }
      />

      {books.length === 0 ? (
        <div className="rounded border border-ivory/10 bg-ivory/5 px-6 py-12 text-center">
          <p className="font-sans text-sm text-mist">No books yet.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2" role="list">
          {books.map((book, index) => (
            <li key={book.slug} className="flex flex-wrap items-center gap-4 rounded border border-ivory/10 bg-ivory/5 p-4">
              <span className="w-6 text-center font-sans text-xs text-mist tabular-nums">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/books/${book.slug}`}
                    className="font-sans text-sm font-semibold text-ivory underline-offset-4 hover:underline"
                  >
                    {book.title}
                  </Link>
                  <StatusPill tone={STATUS_TONE[book.status]}>{book.status}</StatusPill>
                  {book.featured && <StatusPill tone="gold">Featured</StatusPill>}
                  {book.stripeProductId && <StatusPill tone="green">Stripe</StatusPill>}
                </div>
                <p className="mt-1 truncate font-sans text-xs text-mist">
                  {book.category ?? "no category"}
                  {book.priceCents !== undefined ? ` · $${(book.priceCents / 100).toFixed(2)}` : ""}
                  {book.purchase.kind === "stripe-checkout" ? " · Stripe Checkout" : book.purchase.kind === "external" ? " · External link" : " · No purchase"}
                </p>
              </div>
              <BookRowActions slug={book.slug} title={book.title} status={book.status} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
