import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = '/Users/edv/Documents/cp/test_reports/staging-uat-carlophillips-2026-08-22/live-staging-test';
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

  await page.goto('https://staging.carlophillips.com/#signature-runway', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Screenshot of Hero with centered controls + timestamps
  await page.screenshot({ path: join(outDir, '04-live-hero-centered-controls.png') });

  // 2. Open Gallery Overlay
  const viewGalleryBtn = page.locator('button[data-media-trigger="signature-hoodie"]');
  await viewGalleryBtn.click();
  await page.waitForTimeout(1000);

  // 3. Screenshot of Gallery Overlay with bottom thumbnails
  await page.screenshot({ path: join(outDir, '05-live-overlay-bottom-thumbnails.png') });

  await browser.close();
  console.log('Mockup features screenshot test completed.');
}

run().catch(console.error);
