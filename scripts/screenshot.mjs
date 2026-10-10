// QA helper: full-page screenshots at several viewport widths.
// Usage: node scripts/screenshot.mjs <url> <outDir> [widths...]
// Uses the system Chrome (channel "chrome"); scrolls the page so scroll-reveal
// sections animate in before capture, and reports console errors and overflow.
import { chromium } from "playwright";

const [url = "http://localhost:3000/", outDir = "/tmp", ...widthArgs] = process.argv.slice(2);
const widths = widthArgs.length ? widthArgs.map(Number) : [390, 768, 1024, 1440];
const reducedMotion = process.env.REDUCED_MOTION === "1" ? "reduce" : "no-preference";

const browser = await chromium.launch({ channel: "chrome" });
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: "networkidle" });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const hidden = await page.$$eval("[data-reveal]", (els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
  const file = `${outDir}/page-${width}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`${width}px  height=${height}  horizontalOverflow=${overflow}px  hiddenReveals=${hidden}  pageErrors=${errors.length}  -> ${file}`);
  errors.forEach((e) => console.log("   error:", e));
  await page.close();
}
await browser.close();
