import { chromium } from 'playwright-core';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const url = 'https://carlophillips-site.vercel.app';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const enterBtn = page.getByRole('button', { name: /enter/i });
  if (await enterBtn.isVisible().catch(() => false)) {
    await enterBtn.click();
    await page.waitForTimeout(1500);
  }
  
  const bodyText = await page.innerText('body');
  const hasException = bodyText.includes('VIDEO UNAVAILABLE');
  console.log('VIDEO UNAVAILABLE exception displayed:', hasException);
  
  const videos = await page.locator('video').all();
  console.log('Video elements count:', videos.length);
  for (let i = 0; i < videos.length; i++) {
    const src = await videos[i].getAttribute('src');
    const poster = await videos[i].getAttribute('poster');
    console.log(`Video ${i+1}: src=${src}, poster=${poster}`);
  }
  
  await page.screenshot({ path: 'test_reports/discovery-stage-video-verified.png' });
  console.log('Captured verification screenshot: test_reports/discovery-stage-video-verified.png');
  await browser.close();
}

run().catch(console.error);
