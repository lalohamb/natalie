import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { books as seedBooks } from "@/content/books";
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

const manifestSchema = z.array(bookSchema);

// ---------------------------------------------------------------------------
// Seed: convert static Book entries to AdminBook format
// ---------------------------------------------------------------------------

function seedToAdmin(): AdminBook[] {
  return seedBooks.map((b, i) => ({
    slug: b.slug,
    title: b.title,
    subtitle: b.subtitle,
    status: b.status,
    priceCents: b.priceCents,
    summary: b.summary,
    description: b.description,
    // StaticImageData has a `.src` string — use it as the coverUrl so images
    // aren't lost when the store is seeded from books.ts.
    coverUrl: b.coverIsMockup ? undefined : (b.cover.src as unknown as { src: string }).src ?? String(b.cover.src),
    coverAlt: b.cover.alt,
    coverIsMockup: b.coverIsMockup,
    forewordBy: b.forewordBy,
    note: b.note,
    companionOf: b.companionOf,
    purchase: b.purchase,
    featured: b.featured,
    category: b.category,
    stripeProductId: b.stripeProductId,
    displayOrder: i + 1,
    createdAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Read / write
// ---------------------------------------------------------------------------

export async function readBooks(): Promise<AdminBook[]> {
  let raw: string;
  try {
    raw = await fs.readFile(MANIFEST_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(seedToAdmin());
    throw err;
  }
  return manifestSchema.parse(JSON.parse(raw)).sort((a, b) => a.displayOrder - b.displayOrder);
}

let writeQueue: Promise<unknown> = Promise.resolve();

export function updateBooks<T>(mutate: (books: AdminBook[]) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const books = await readBooks();
    const result = await mutate(books);
    books.sort((a, b) => a.displayOrder - b.displayOrder).forEach((b, i) => (b.displayOrder = i + 1));
    await writeFileAtomic(MANIFEST_PATH, JSON.stringify(manifestSchema.parse(books), null, 2) + "\n");
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
