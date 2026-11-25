import fs from "node:fs";
import path from "node:path";
import { test, expect } from "playwright/test";
// Must stay the first project import: it redirects the store to a temp directory.
import { tempStorageDir } from "./temp-storage";
import { readBooks, updateBooks } from "@/lib/book-store";
import { STORAGE_DIR } from "@/lib/storage";

/**
 * The book store must never lose books (docs/KNOWN-GAPS.md G-34).
 * Runs against a throw-away directory — see ./temp-storage.ts.
 */

const dir = tempStorageDir;
const file = path.join(dir, "books.json");

const book = (slug: string, displayOrder: number) => ({
  slug,
  title: `Title ${slug}`,
  status: "published",
  summary: "Summary",
  description: ["Paragraph"],
  purchase: { kind: "none" },
  featured: false,
  displayOrder,
  createdAt: "2026-11-20T00:00:00.000Z",
});

const write = (content: unknown) => fs.writeFileSync(file, typeof content === "string" ? content : JSON.stringify(content));
const onDisk = () => fs.readFileSync(file, "utf8");

test.describe("book store", () => {
  test.beforeEach(() => fs.rmSync(file, { force: true }));
  test.afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  test("the store really is the temp directory, not the project's storage/", async () => {
    expect(STORAGE_DIR).toBe(dir);
    expect(STORAGE_DIR.startsWith(process.cwd())).toBe(false);
  });

  test("first run: no file is an empty catalog, and reading does not create one", async () => {
    expect(await readBooks()).toEqual([]);
    expect(fs.existsSync(file)).toBe(false);
  });

  test("the first save creates the file", async () => {
    await updateBooks((books) => {
      books.push(book("first", 1) as never);
    });
    expect((await readBooks()).map((b) => b.slug)).toEqual(["first"]);
    expect(JSON.parse(onDisk())).toMatchObject({ version: 3 });
  });

  for (const [name, content] of [
    ["an older version number", { version: 1, books: [book("b", 2), book("a", 1)] }],
    ["no version number", { books: [book("b", 2), book("a", 1)] }],
    ["a newer version number", { version: 99, books: [book("b", 2), book("a", 1)] }],
    ["the original bare-array format", [book("b", 2), book("a", 1)]],
  ] as const) {
    test(`a file with ${name} keeps its books and is not rewritten by reading`, async () => {
      write(content);
      const before = onDisk();
  
      expect((await readBooks()).map((b) => b.slug)).toEqual(["a", "b"]);
      expect(onDisk()).toBe(before);
    });
  }

  test("saving to an older-format file carries every existing book over", async () => {
    write({ version: 1, books: [book("a", 1), book("b", 2)] });

    await updateBooks((books) => {
      books.push(book("c", 3) as never);
    });
    expect((await readBooks()).map((b) => b.slug)).toEqual(["a", "b", "c"]);
  });

  test("a damaged file is an error, never an empty catalog, and is left untouched", async () => {

    for (const damaged of ["{ not json", JSON.stringify({ version: 3, books: [{ slug: "only-a-slug" }] }), JSON.stringify({ version: 3 })]) {
      write(damaged);
      await expect(readBooks()).rejects.toThrow();
      await expect(updateBooks((books) => void books.push(book("x", 1) as never))).rejects.toThrow();
      expect(onDisk()).toBe(damaged);
    }
  });

  test("an empty catalog on disk stays empty (nothing is seeded)", async () => {
    write({ version: 3, books: [] });
    expect(await readBooks()).toEqual([]);
  });
});
