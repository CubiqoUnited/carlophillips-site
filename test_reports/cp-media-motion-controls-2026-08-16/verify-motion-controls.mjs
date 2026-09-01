import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.CP_QA_TARGET_URL || 'http://127.0.0.1:3137';
const output = path.resolve(process.env.CP_QA_OUTPUT || 'test_reports/cp-media-motion-controls-2026-08-16');
const viewports = [
  { id: 'desktop-1440x1000', width: 1440, height: 1000 },
  { id: 'tablet-1024x768', width: 1024, height: 768 },
  { id: 'mobile-390x844', width: 390, height: 844 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    const requestFailures = [];
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', request => {
      if (request.failure()?.errorText !== 'net::ERR_ABORTED') requestFailures.push(request.url());
    });

    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    assert(response?.status() === 200, `${viewport.id}: home returned ${response?.status()}`);
    await page.locator('[data-media-trigger="signature-hoodie"]').click();
    const overlay = page.locator('#product-media-overlay');
    await overlay.waitFor({ state: 'visible' });

    const motionControl = overlay.locator('.cp-media-jump');
    assert(await motionControl.getAttribute('aria-label') === 'Jump to motion study', `${viewport.id}: initial control is not Jump`);
    await motionControl.click();
    await page.waitForFunction(() => document.querySelector('.cp-media-jump')?.getAttribute('aria-label') === 'Pause motion study');
    await page.waitForFunction(() => {
      const track = document.querySelector('.cp-media-track');
      const status = document.querySelector('.cp-media-header-status .cp-eyebrow');
      return track
        && Math.abs(track.scrollLeft - (3 * track.clientWidth)) < 2
        && status?.textContent?.includes('04 / 12');
    });

    const motionSlide = overlay.locator('.cp-media-slide').nth(3);
    const motionImage = motionSlide.locator('img');
    const playingSource = await motionImage.getAttribute('src');
    assert(playingSource?.includes('still-derived-motion-study.gif'), `${viewport.id}: motion did not switch to GIF: ${playingSource}`);
    assert(await motionControl.getAttribute('aria-pressed') === 'true', `${viewport.id}: playing state is not pressed`);
    assert(await motionSlide.locator('.cp-media-caption').count() === 0, `${viewport.id}: motion caption remains visible`);
    assert(await overlay.locator('.cp-media-caption').count() === 11, `${viewport.id}: non-motion captions changed unexpectedly`);
    await page.screenshot({ path: path.join(output, `${viewport.id}-playing.png`), fullPage: false });

    await motionControl.click();
    await page.waitForFunction(() => document.querySelector('.cp-media-jump')?.getAttribute('aria-label') === 'Play motion study');
    await page.waitForTimeout(100);
    const pausedSource = await motionImage.getAttribute('src');
    assert(pausedSource?.includes('still-derived-motion-study-poster.webp'), `${viewport.id}: pause did not switch to the still poster: ${pausedSource}`);
    assert(await motionControl.getAttribute('aria-pressed') === 'false', `${viewport.id}: paused state is still pressed`);
    await page.screenshot({ path: path.join(output, `${viewport.id}-paused.png`), fullPage: false });

    await motionControl.click();
    await page.waitForFunction(() => document.querySelector('.cp-media-jump')?.getAttribute('aria-label') === 'Pause motion study');
    assert((await motionImage.getAttribute('src'))?.includes('still-derived-motion-study.gif'), `${viewport.id}: Play did not restore motion`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${viewport.id}: horizontal overflow`);
    assert(consoleErrors.length === 0, `${viewport.id}: console errors: ${consoleErrors.join(' | ')}`);
    assert(requestFailures.length === 0, `${viewport.id}: request failures: ${requestFailures.join(' | ')}`);

    results.push({ viewport, playingSource, pausedSource, consoleErrors, requestFailures });
    await page.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(output, 'report.json'), `${JSON.stringify({ baseUrl, visibility: 'headless/background', results }, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, viewports: results.length, transitions: results.length * 3 }));
