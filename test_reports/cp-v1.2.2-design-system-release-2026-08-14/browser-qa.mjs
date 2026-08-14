import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/edv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const baseUrl = 'http://127.0.0.1:3000';
const evidenceRoot = 'test_reports/cp-v1.2.2-design-system-release-2026-08-14';
const screenshotRoot = `${evidenceRoot}/screenshots`;
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'compact', width: 584, height: 486 },
  { name: 'mobile', width: 390, height: 844 },
];

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(250);
}

async function routeHealth(page) {
  const result = await page.evaluate(() => ({
    bodyTextLength: document.body.innerText.trim().length,
    frameworkOverlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    providerLeakage: document.body.innerText.toLowerCase().includes('shopify'),
  }));
  return result;
}

async function decodePageMedia(page) {
  return page.evaluate(async () => {
    const originalY = window.scrollY;
    const step = Math.max(240, Math.floor(window.innerHeight * 0.7));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    const images = [...document.images];
    await Promise.all(images.map(image => image.decode?.().catch(() => {})));
    const brokenImages = images
      .filter(image => image.complete && image.naturalWidth === 0)
      .map(image => image.currentSrc || image.src || image.alt);
    const videos = [...document.querySelectorAll('video')];
    const brokenVideos = videos
      .filter(video => video.error)
      .map(video => video.currentSrc || video.src || 'video');
    window.scrollTo(0, originalY);
    return { imageCount: images.length, brokenImages, videoCount: videos.length, brokenVideos };
  });
}

async function openRoute(page, path) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page);
  return response?.status() || 0;
}

async function verifyGallery(page, viewportName) {
  const trigger = page.locator('[data-media-trigger="signature-hoodie"]');
  await trigger.focus();
  const focusOutline = await trigger.evaluate(element => getComputedStyle(element).outlineStyle);
  await trigger.click();
  const dialog = page.locator('#product-media-overlay');
  await dialog.waitFor({ state: 'visible' });
  await page.waitForTimeout(100);

  const mediaCount = await page.locator('.cp-media-slide').count();
  const decoded = [];
  const labels = [];
  const disclosures = [];
  for (let index = 0; index < mediaCount; index += 1) {
    if (index > 0) {
      await page.getByRole('button', { name: 'Next product image' }).click();
      await page.getByText(`${String(index + 1).padStart(2, '0')} / ${String(mediaCount).padStart(2, '0')}`).waitFor();
      await page.waitForFunction(expectedIndex => {
        const track = document.querySelector('.cp-media-track');
        return track && Math.abs(track.scrollLeft - expectedIndex * track.clientWidth) < 2;
      }, index);
    }
    const slide = page.locator('.cp-media-slide').nth(index);
    const asset = slide.locator('img, video').first();
    await asset.scrollIntoViewIfNeeded();
    const state = await asset.evaluate(async element => {
      if (element instanceof HTMLImageElement) {
        await element.decode().catch(() => {});
        return { type: 'image', decoded: element.complete && element.naturalWidth > 0, width: element.naturalWidth, height: element.naturalHeight };
      }
      return { type: 'video', decoded: !element.error && element.readyState >= 1, width: element.videoWidth, height: element.videoHeight };
    });
    decoded.push(state);
    labels.push(await slide.locator('figcaption span').first().innerText());
    disclosures.push(await slide.locator('figcaption span').last().innerText());
  }

  await page.keyboard.press('Tab');
  const focusContainedAfterTab = await dialog.evaluate(element => element.contains(document.activeElement));
  await page.keyboard.press('ArrowLeft');
  await page.getByText(`${String(mediaCount - 1).padStart(2, '0')} / ${String(mediaCount).padStart(2, '0')}`).waitFor();
  await page.waitForFunction(expectedIndex => {
    const track = document.querySelector('.cp-media-track');
    return track && Math.abs(track.scrollLeft - expectedIndex * track.clientWidth) < 2;
  }, mediaCount - 2);
  const keyboardChangedIndex = (await page.locator('.cp-media-header-status .cp-eyebrow').innerText()) === `${String(mediaCount - 1).padStart(2, '0')} / ${String(mediaCount).padStart(2, '0')}`;
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForTimeout(50);
  const focusReturned = await trigger.evaluate(element => document.activeElement === element);

  return {
    viewportName,
    mediaCount,
    decoded,
    labels,
    disclosures,
    focusOutline,
    focusContainedAfterTab,
    keyboardChangedIndex,
    focusReturned,
  };
}

async function verifyTouchSwipe(page) {
  const trigger = page.locator('[data-media-trigger="signature-hoodie"]');
  await trigger.click();
  const track = page.locator('.cp-media-track');
  await track.waitFor({ state: 'visible' });
  const box = await track.boundingBox();
  const before = await track.evaluate(element => element.scrollLeft);
  const session = await page.context().newCDPSession(page);
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * 0.82;
  const endX = box.x + box.width * 0.18;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
  for (let step = 1; step <= 6; step += 1) {
    const x = startX + ((endX - startX) * step) / 6;
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(500);
  const after = await track.evaluate(element => element.scrollLeft);
  await page.keyboard.press('Escape');
  return { before, after, changed: after > before };
}

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--disable-background-networking', '--disable-default-apps', '--no-first-run'],
});

const report = {
  schemaVersion: 'cp.ui-verification.v1.2.2',
  date: '2026-08-14',
  method: 'headless background Google Chrome via bundled Playwright (agent-browser launcher unavailable)',
  baseUrl,
  viewports: [],
  gallery: null,
  touchSwipe: null,
  reducedMotion: null,
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      hasTouch: viewport.name === 'mobile',
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => {
      const reason = request.failure()?.errorText || 'unknown';
      if (!reason.includes('ERR_ABORTED')) requestFailures.push(`${reason}: ${request.url()}`);
    });

    const homeStatus = await openRoute(page, '/');
    const heroText = await page.locator('.cp-campaign').innerText();
    const heroAsset = await page.locator('.cp-campaign-image').getAttribute('src');
    const headerVisible = await page.locator('.cp-site-header').isVisible();
    const homeHealth = await routeHealth(page);
    await page.screenshot({ path: `${screenshotRoot}/${viewport.name}-home-hero.png` });

    await page.locator('#signature-runway').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const productText = await page.locator('#signature-runway').innerText();
    const productTags = await page.locator('.cp-product-facts li').allInnerTexts();
    const viewCountText = await page.locator('[data-media-trigger="signature-hoodie"] .cp-text-align-end').innerText();
    const descriptionMetrics = await page.locator('.cp-product-review').evaluate(element => {
      const style = getComputedStyle(element);
      return { lines: Math.round(element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight)), rect: element.getBoundingClientRect().toJSON() };
    });
    const copyRect = await page.locator('.cp-product-copy').evaluate(element => element.getBoundingClientRect().toJSON());
    await page.screenshot({ path: `${screenshotRoot}/${viewport.name}-home-one.png` });

    const trigger = page.locator('[data-media-trigger="signature-hoodie"]');
    await trigger.click();
    const panel = page.locator('.cp-media-panel');
    await panel.waitFor({ state: 'visible' });
    await page.locator('.cp-media-slide').first().locator('img, video').first().evaluate(async element => {
      if (element instanceof HTMLImageElement) await element.decode();
    });
    const overlayRect = await panel.evaluate(element => element.getBoundingClientRect().toJSON());
    const bodyOverflow = await page.locator('body').evaluate(element => getComputedStyle(element).overflow);
    await page.screenshot({ path: `${screenshotRoot}/${viewport.name}-home-overlay.png` });
    await page.keyboard.press('Escape');

    if (viewport.name === 'desktop') report.gallery = await verifyGallery(page, viewport.name);
    if (viewport.name === 'mobile') report.touchSwipe = await verifyTouchSwipe(page);

    const routes = [];
    for (const route of [
      { name: 'shop', path: '/shop' },
      { name: 'pdp', path: '/products/carlophillips-signature-hoodie' },
      { name: 'bag', path: '/bag' },
    ]) {
      const status = await openRoute(page, route.path);
      const health = await routeHealth(page);
      const title = await page.title();
      const text = (await page.locator('body').innerText()).slice(0, 500);
      await page.screenshot({ path: `${screenshotRoot}/${viewport.name}-${route.name}.png` });
      const media = await decodePageMedia(page);
      routes.push({ ...route, status, title, text, health, media });
    }

    report.viewports.push({
      ...viewport,
      homeStatus,
      heroText,
      heroAsset,
      headerVisible,
      homeHealth,
      productText,
      productTags,
      viewCountText,
      descriptionMetrics,
      copyRect,
      overlayRect,
      overlayInset: overlayRect.x > 0 && overlayRect.y > 0 && overlayRect.width < viewport.width && overlayRect.height < viewport.height,
      bodyOverflow,
      routes,
      consoleErrors,
      pageErrors,
      requestFailures,
    });
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await openRoute(page, '/');
  report.reducedMotion = await page.evaluate(() => ({
    campaignAnimation: getComputedStyle(document.querySelector('.cp-campaign-image')).animationName,
    scrollAnimation: getComputedStyle(document.querySelector('.cp-scroll-arrow')).animationName,
    runwayAnimation: getComputedStyle(document.querySelector('.cp-runway-frame')).animationName,
    imageTransition: getComputedStyle(document.querySelector('.cp-campaign-image')).transitionDuration,
    htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  await context.close();
} finally {
  await browser.close();
}

writeFileSync(`${evidenceRoot}/browser-verification.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
