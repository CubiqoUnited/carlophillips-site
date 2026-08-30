import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const target = process.env.CP_HERO_QA_TARGET || 'https://staging.carlophillips.com';
  console.log(`Testing stationary landing hero on ${target}...`);
  await page.goto(target, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const heroMedia = page.locator('.cp-landing-scene').first();
  const exists = await heroMedia.count() > 0;
  console.log('Hero poster element exists:', exists);
  if (exists) {
    const src = await heroMedia.getAttribute('src');
    console.log('Hero poster src:', src);
  }
  console.log('Hero video count:', await page.locator('#landing-hero video').count());
  
  await page.screenshot({ path: 'test_reports/live-hero-stationary.png' });
  console.log('Screenshot saved: test_reports/live-hero-stationary.png');
  await browser.close();
}

run().catch(console.error);
