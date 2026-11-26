import { test, expect, type Page } from "playwright/test";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "test-password";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/admin");
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

test.describe("Admin auth", () => {
  test("unauthenticated /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated /admin/books redirects to login", async ({ page }) => {
    await page.goto("/admin/books");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("wrong password shows error, stays on login", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator('input[name="password"]').fill("wrong-password");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]')).toContainText(/incorrect password/i);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("correct password reaches admin dashboard", async ({ page }) => {
    test.skip(!process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD not set in test environment");
    await login(page);
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Books (requires auth)
// ---------------------------------------------------------------------------

test.describe("Admin books", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.ADMIN_PASSWORD, "ADMIN_PASSWORD not set in test environment");
    await login(page);
  });

  test("books list page renders", async ({ page }) => {
    await page.goto("/admin/books");
    await expect(page.getByRole("link", { name: /add book/i })).toBeVisible();
  });

  test("add book form renders required fields", async ({ page }) => {
    await page.goto("/admin/books/new");
    await expect(page.locator("#title")).toBeVisible();
    await expect(page.locator("#summary")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("submitting add book with no title shows validation error", async ({ page }) => {
    await page.goto("/admin/books/new");
    await page.locator("#summary").fill("A summary.");
    await page.locator("#description").fill("A description.");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]')).toContainText(/title is required/i);
  });

  test("catalog books are listed", async ({ page }) => {
    await page.goto("/admin/books");
    // At least one of the known catalog slugs must appear
    await expect(page.locator("main, ol")).toContainText(/repairing the breach|war in the wait|chaos to the call/i);
  });
});
