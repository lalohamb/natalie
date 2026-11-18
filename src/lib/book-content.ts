import "server-only";

import { cacheTag } from "next/cache";
import type { AdminBook } from "@/content/types";
import { readBooks } from "@/lib/book-store";

export const BOOKS_CACHE_TAG = "books";

export async function getAdminBooks(): Promise<AdminBook[]> {
  "use cache";
  cacheTag(BOOKS_CACHE_TAG);
  return readBooks();
}

export async function getPublishedBooks(): Promise<AdminBook[]> {
  return (await getAdminBooks()).filter((b) => b.status === "published");
}

export async function getAdminBook(slug: string): Promise<AdminBook | undefined> {
  return (await getAdminBooks()).find((b) => b.slug === slug);
}

// Aliases used by pages that import from @/lib/book-content
export const getBooks = getPublishedBooks;
export const getBook = getAdminBook;
