import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = '/Users/edv/Documents/cp/test_reports/staging-uat-carlophillips-2026-08-22/first-pass';
mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  }).catch(() => chromium.launch({ headless: true }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/#signature-runway...');
  await page.goto('http://localhost:3000/#signature-runway', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capture Hero Section with both CTAs
  await page.screenshot({ path: join(outDir, '01-hero-both-ctas-desktop.png') });
  console.log('Captured: 01-hero-both-ctas-desktop.png');

  // 2. Click ORDER button to open purchase tray
  const orderButton = page.locator('.cp-product-order-button');
  if (await orderButton.isVisible()) {
    console.log('Found ORDER button, clicking...');
    await orderButton.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(outDir, '02-purchase-tray-open-sizes.png') });
    console.log('Captured: 02-purchase-tray-open-sizes.png');

    // Click Size & Fit link
    const sizeFitButton = page.locator('.cp-order-size-heading button');
    if (await sizeFitButton.isVisible()) {
      await sizeFitButton.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: join(outDir, '03-size-fit-drawer.png') });
      console.log('Captured: 03-size-fit-drawer.png');

      // Close size fit drawer
      const closeDrawer = page.locator('.cp-side-drawer button[aria-label="Close size and fit guide"]');
      if (await closeDrawer.isVisible()) await closeDrawer.click();
    }
  }

  // Reload and test gallery
  await page.goto('http://localhost:3000/#signature-runway', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const galleryButton = page.locator('button[data-media-trigger="signature-hoodie"]');
  if (await galleryButton.isVisible()) {
    console.log('Found Gallery button, clicking...');
    await galleryButton.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(outDir, '04-gallery-overlay-open.png') });
    console.log('Captured: 04-gallery-overlay-open.png');
  }

  await browser.close();
  console.log('All first-pass captures completed successfully.');
}

run().catch(console.error);
