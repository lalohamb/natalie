import { test, expect } from "playwright/test";

/**
 * Ministry identity regression tests (M2).
 * Confirms EQUIP · RESTORE · ACTIVATE are the primary pillars,
 * the official statement is present, and Prayer/Prophecy/Purpose
 * remain accessible as supporting ministry content.
 */

test("ministry page — three core values are present", async ({ page }) => {
  await page.goto("/ministry");

  await expect(page.getByRole("heading", { name: /equip/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /restore/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /activate/i }).first()).toBeVisible();
});

test("ministry page — official statement is rendered", async ({ page }) => {
  await page.goto("/ministry");

  await expect(page.locator("body")).toContainText(
    "Equipping believers to discern the voice of God."
  );
  await expect(page.locator("body")).toContainText(
    "Restoring integrity in how they live, lead, and carry their calling."
  );
  await expect(page.locator("body")).toContainText(
    "Activating them to walk fully in their purpose and advance the Kingdom of God."
  );
});

test("ministry page — Prayer, Prophecy, Purpose remain as supporting content", async ({ page }) => {
  await page.goto("/ministry");

  await expect(page.locator("body")).toContainText(/prayer/i);
  await expect(page.locator("body")).toContainText(/prophecy/i);
  await expect(page.locator("body")).toContainText(/purpose/i);
});

test("homepage — ministry pillars section is present", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toContainText(/from the chaos to the call/i);
  await expect(page.getByRole("heading", { name: /equip/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /restore/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /activate/i }).first()).toBeVisible();
});

test("about page — 2026 biography sections are present", async ({ page }) => {
  await page.goto("/about");

  // Identity line from 2026 bio header
  await expect(page.locator("body")).toContainText(/trailblazing spiritual midwife/i);
  // Ministry journey: Fertilizing Your Faith
  await expect(page.locator("body")).toContainText(/fertilizing your faith/i);
  // January 2024 relaunch
  await expect(page.locator("body")).toContainText(/january 2024/i);
  // Leadership: GO Church Chicago
  await expect(page.locator("body")).toContainText(/go church chicago/i);
  // Marketplace: nursing credentials
  await expect(page.locator("body")).toContainText(/bachelor of science in nursing/i);
});
