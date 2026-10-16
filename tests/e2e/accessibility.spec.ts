import { test, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests — every public page must have zero axe critical or
 * serious violations (WCAG 2.2 AA target).
 *
 * These tests run in Chromium only (axe is a DOM-based tool; one browser
 * is sufficient for accessibility scanning).
 */

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/ministry",
  "/books",
  "/books/repairing-the-breach",
  "/books/repair-the-breach-workbook",
  "/books/the-midwife-to-your-destiny",
  "/books/war-in-the-wait",
  "/books/from-the-chaos-to-the-call",
  "/events",
  "/media",
  "/store",
  "/partnerships",
  "/contact",
  "/privacy",
  "/terms",
];

for (const route of PUBLIC_ROUTES) {
  test(`${route} — zero axe critical/serious violations`, async ({ page }, testInfo) => {
    // Run axe scans in Chromium only
    test.skip(testInfo.project.name !== "chromium", "axe scans run in Chromium only");

    await page.goto(route);

    // Wait for the page to be fully rendered
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      // Exclude the color-contrast rule for decorative gold rules which are
      // aria-hidden — axe cannot distinguish decorative from informational
      // without additional context. All text pairings are manually verified
      // in globals.css.
      .exclude("[aria-hidden='true']")
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (criticalOrSerious.length > 0) {
      const summary = criticalOrSerious
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`)
        .join("\n\n");
      expect.soft(criticalOrSerious, `Axe violations on ${route}:\n\n${summary}`).toHaveLength(0);
    }

    expect(criticalOrSerious).toHaveLength(0);
  });
}
