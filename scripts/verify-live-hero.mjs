import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('Testing landing hero video on live site...');
  await page.goto('https://carlophillips-site.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const heroVideo = await page.locator('.cp-landing-video').first();
  const exists = await heroVideo.count() > 0;
  console.log('Hero video element exists:', exists);
  if (exists) {
    const src = await heroVideo.getAttribute('src');
    const poster = await heroVideo.getAttribute('poster');
    console.log('Hero video src:', src, 'poster:', poster);
  }
  
  await page.screenshot({ path: 'test_reports/live-hero-video-active.png' });
  console.log('Screenshot saved: test_reports/live-hero-video-active.png');
  await browser.close();
}

run().catch(console.error);
