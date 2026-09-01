import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const url = 'https://carlophillips-site.vercel.app';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test_reports/01-live-landing-pre-morph.png' });
  console.log('1. Captured Pre-morph');

  const enterBtn = await page.getByRole('button', { name: /enter/i }).first();
  if (await enterBtn.isVisible().catch(() => false)) {
    await enterBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_reports/02-live-discovery-stage.png' });
    console.log('2. Captured Discovery stage');
  }

  const galleryBtn = await page.getByRole('button', { name: /view gallery/i }).first();
  if (await galleryBtn.isVisible().catch(() => false)) {
    await galleryBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_reports/03-live-gallery-overlay.png' });
    console.log('3. Captured Gallery overlay');
    const closeBtn = await page.getByRole('button', { name: /close/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  const orderBtn = await page.getByRole('button', { name: /order/i }).first();
  if (await orderBtn.isVisible().catch(() => false)) {
    await orderBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test_reports/04-live-order-tray.png' });
    console.log('4. Captured Order tray');
  }

  await browser.close();
  console.log('All live captures complete.');
}

run().catch(console.error);
