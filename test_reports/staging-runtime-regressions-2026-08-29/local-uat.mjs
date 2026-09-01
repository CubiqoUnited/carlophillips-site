import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const target = process.env.CP_UAT_TARGET || 'http://127.0.0.1:4317';
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];
const checks = [];

function check(name, value, detail = null) {
  checks.push({ name, passed: Boolean(value), detail });
  if (!value) failures.push(name);
}

async function makePage(viewport, name) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto(`${target}/`, { waitUntil: 'networkidle', timeout: 60_000 });
  check(`${name}: landing uses no video`, await page.locator('#landing-hero video').count() === 0);
  check(`${name}: landing poster present`, await page.locator('#landing-hero .cp-landing-scene').count() === 1);

  await page.locator('.cp-landing-enter').evaluate(button => button.click());
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(3800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outputDir, `${name}-landing-post-morph.png`), fullPage: false });
  check(`${name}: post-morph state`, await page.locator('#landing-hero').getAttribute('data-landing-state') === 'post-morph');

  await page.locator('#signature-runway').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const stage = await page.locator('.cp-stage').evaluate(element => {
    const video = element.querySelector('video');
    const controls = [...element.querySelectorAll('.cp-stage-control')].map(button => button.getAttribute('aria-label'));
    const progress = element.querySelector('.cp-stage-progress');
    const progressColor = progress ? getComputedStyle(progress).getPropertyValue('--cp-component-product-progress-color') : '';
    return {
      state: element.dataset.stageState,
      source: video?.getAttribute('src'),
      paused: video?.paused,
      muted: video?.muted,
      controls,
      controlCount: controls.length,
      progressColor,
      dashes: element.querySelectorAll('.cp-stage-dash').length,
    };
  });
  check(`${name}: product autoplays`, stage.state === 'playing' && stage.paused === false, stage);
  check(`${name}: product is muted`, stage.muted === true, stage);
  check(`${name}: approved sequence clip is playing`, /\/(?:fit-silhouette|runway-motion)-final\.mp4$/.test(stage.source || ''), stage);
  check(`${name}: Pause is visible`, stage.controls.includes('Pause product video'), stage);
  check(`${name}: overlay control is visible`, stage.controls.includes('Open product media overlay'), stage);
  check(`${name}: three media dashes`, stage.dashes === 3, stage);
  await page.screenshot({ path: path.join(outputDir, `${name}-product-playing.png`), fullPage: false });

  await page.locator('.cp-stage-control[aria-label="Open product media overlay"]').click();
  await page.waitForTimeout(500);
  const gallery = await page.locator('#product-media-overlay').evaluate(element => ({
    videos: element.querySelectorAll('video').length,
    images: element.querySelectorAll('img').length,
    animated: [...element.querySelectorAll('img')].filter(image => /\.gif(?:$|\?)/i.test(image.currentSrc || image.src)).length,
  }));
  check(`${name}: gallery contains only pictures`, gallery.videos === 0 && gallery.animated === 0 && gallery.images > 0, gallery);
  await page.screenshot({ path: path.join(outputDir, `${name}-gallery-pictures-only.png`), fullPage: false });
  check(`${name}: no console errors`, consoleErrors.length === 0, consoleErrors);
  await context.close();
}

await makePage({ width: 1440, height: 1000 }, 'desktop');
await makePage({ width: 390, height: 844 }, 'mobile');

const checkoutContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await checkoutContext.addInitScript(() => {
  localStorage.setItem('cp-bag-v1', JSON.stringify({
    schemaVersion: 'cp.client-bag.v1',
    lines: [{
      handle: 'carlophillips-signature-hoodie',
      referenceHash: 'qa-size-m',
      title: 'ONE',
      size: 'M',
      color: 'Black',
      currency: 'EUR',
      unitPrice: 180,
      quantity: 1,
      imageUrl: '/products/signature-hoodie/candidates/moda/model-front-full.jpg',
      imageAlt: 'CARLOPHILLIPS Signature Hoodie in black',
    }],
    discount: { code: '', status: 'idle' },
  }));
});
const checkout = await checkoutContext.newPage();
await checkout.goto(`${target}/checkout`, { waitUntil: 'networkidle', timeout: 60_000 });
await checkout.waitForSelector('#country');
const countries = await checkout.locator('#country option').allTextContents();
check('checkout: United States is available', countries.includes('United States'), countries);
await checkout.selectOption('#country', 'US');
await checkout.screenshot({ path: path.join(outputDir, 'desktop-checkout-united-states.png'), fullPage: false });
await checkoutContext.close();

const report = { target, checks, failures };
await fs.writeFile(path.join(outputDir, 'local-uat.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (failures.length) process.exitCode = 1;
