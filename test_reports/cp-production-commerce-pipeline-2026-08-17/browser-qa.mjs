import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.CP_QA_URL ?? "http://127.0.0.1:3142";
const route = "/products/carlophillips-signature-hoodie";
const reportDir = path.resolve("test_reports/cp-production-commerce-pipeline-2026-08-17");
const screenshotDir = path.join(reportDir, "screenshots");
const baselineDir = path.resolve("test_reports/cp-shopify-checkout-handoff-2026-08-16/screenshots");

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const target of [
  { name: "desktop", viewport: { width: 1440, height: 1000 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
]) {
  const context = await browser.newContext({ viewport: target.viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.localStorage.setItem("cp-consent", "essential-only");
  });
  await page.reload({ waitUntil: "networkidle" });

  const screenshotPath = path.join(screenshotDir, `${target.name}-draft-denial.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const bodyText = await page.locator("body").innerText();
  const checkoutForms = await page.locator('form[action*="checkout"], form[action*="cart"], button:has-text("Checkout"), button:has-text("Buy")').count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const overlays = await page.locator("nextjs-portal").count();

  const baselinePath = path.join(baselineDir, `${target.name}-draft-denial.png`);
  const baseline = await sharp(await readFile(baselinePath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const candidate = await sharp(await readFile(screenshotPath)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const dimensionsMatch = baseline.info.width === candidate.info.width && baseline.info.height === candidate.info.height;
  let changedPixels = null;
  let materiallyChangedPixels = null;
  let materialChangeRatio = null;
  if (dimensionsMatch) {
    changedPixels = 0;
    materiallyChangedPixels = 0;
    for (let index = 0; index < baseline.data.length; index += 4) {
      const channelDelta = Math.max(
        Math.abs(baseline.data[index] - candidate.data[index]),
        Math.abs(baseline.data[index + 1] - candidate.data[index + 1]),
        Math.abs(baseline.data[index + 2] - candidate.data[index + 2]),
        Math.abs(baseline.data[index + 3] - candidate.data[index + 3]),
      );
      if (channelDelta > 0) changedPixels += 1;
      if (channelDelta > 8) materiallyChangedPixels += 1;
    }
    materialChangeRatio = materiallyChangedPixels / (baseline.info.width * baseline.info.height);
  }

  results.push({
    viewport: target,
    httpStatus: response?.status() ?? null,
    purchasingDisabled: bodyText.toLowerCase().includes("purchasing disabled"),
    checkoutForms,
    overflow,
    runtimeOverlays: overlays,
    consoleErrors,
    pageErrors,
    visualComparison: {
      baseline: path.relative(reportDir, baselinePath),
      candidate: path.relative(reportDir, screenshotPath),
      dimensionsMatch,
      changedPixels,
      materiallyChangedPixels,
      materialChangeRatio,
    },
  });

  await context.close();
}

await browser.close();

const passed = results.every((result) =>
  result.httpStatus === 200 &&
  result.purchasingDisabled &&
  result.checkoutForms === 0 &&
  !result.overflow &&
  result.runtimeOverlays === 0 &&
  result.consoleErrors.length === 0 &&
  result.pageErrors.length === 0 &&
  result.visualComparison.dimensionsMatch &&
  result.visualComparison.materialChangeRatio <= 0.001
);

await writeFile(path.join(reportDir, "browser-qa.json"), `${JSON.stringify({ passed, results }, null, 2)}\n`);
console.log(JSON.stringify({ passed, results }, null, 2));
if (!passed) process.exitCode = 1;
