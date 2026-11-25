import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { z } from "zod";
import { STORAGE_DIR, dataPath, writeFileAtomic } from "@/lib/storage";
import type { AdminBook } from "@/content/types";

const MANIFEST_PATH = dataPath(STORAGE_DIR, "books.json");

import { BOOK_CATEGORIES, BOOK_STATUSES } from "@/content/book-constants";
export { BOOK_CATEGORIES, BOOK_STATUSES } from "@/content/book-constants";

const purchaseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("external"), url: z.string(), label: z.string() }),
  z.object({ kind: z.literal("stripe-checkout"), priceId: z.string(), label: z.string() }),
  z.object({ kind: z.literal("none") }),
]);

const bookSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  status: z.enum(BOOK_STATUSES),
  priceCents: z.number().optional(),
  summary: z.string(),
  description: z.array(z.string()),
  coverUrl: z.string().optional(),
  coverAlt: z.string().optional(),
  coverIsMockup: z.boolean().optional(),
  forewordBy: z.string().optional(),
  note: z.string().optional(),
  companionOf: z.string().optional(),
  purchase: purchaseSchema,
  featured: z.boolean(),
  category: z.enum(BOOK_CATEGORIES).optional(),
  stripeProductId: z.string().optional(),
  displayOrder: z.number(),
  createdAt: z.string(),
});

/*
 * books.json holds `{ version, books }`. `version` identifies the FILE FORMAT
 * only. It must never be used to decide that stored books are out of date:
 * whatever is in the file is the catalog, and nothing here ever replaces or
 * discards it. (An earlier version of this module reset the file to an empty
 * catalog whenever a "seed version" was raised, which deleted every book the
 * admin had entered.)
 *
 * If the format ever has to change, convert old files in `parseBookManifest`
 * so their books are carried over.
 */
const FORMAT_VERSION = 3;

/** Current format, and the older ones still readable: no/any version number, or a bare array of books. */
const manifestSchema = z.union([
  z.object({ version: z.number().optional(), books: z.array(bookSchema) }),
  z.array(bookSchema).transform((books) => ({ version: undefined, books })),
]);

/**
 * Parses the contents of books.json into the catalog, in display order.
 * Throws if the file is not valid — the caller must not "repair" it by
 * overwriting, because that would destroy the catalog.
 */
export function parseBookManifest(raw: string): AdminBook[] {
  return manifestSchema.parse(JSON.parse(raw)).books.sort((a, b) => a.displayOrder - b.displayOrder);
}

// ---------------------------------------------------------------------------
// Read / write
// ---------------------------------------------------------------------------

/**
 * The catalog as stored. A store that has never been written (no books.json)
 * is an empty catalog: books are entered at /admin/books, there is no seed.
 * Reading never writes — the file is created by the first admin save.
 */
export async function readBooks(): Promise<AdminBook[]> {
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return parseBookManifest(raw);
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateBooks<T>(mutate: (books: AdminBook[]) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const books = await readBooks();
    const result = await mutate(books);
    books.sort((a, b) => a.displayOrder - b.displayOrder).forEach((b, i) => (b.displayOrder = i + 1));
    const manifest = { version: FORMAT_VERSION, books };
    manifestSchema.parse(manifest);
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

export const newBookSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) + `-${randomUUID().slice(0, 4)}`;
