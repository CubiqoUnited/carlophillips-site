const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const baseUrl = process.env.CP_UAT_BASE_URL || 'http://127.0.0.1:3140';
const outputDir = path.resolve('test_reports/cp-uat-final-media-analytics');
mkdirSync(outputDir, { recursive: true });

const viewports = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'mobile', width: 390, height: 844 },
];

async function compare(reference, actual, output) {
  const referenceImage = await sharp(reference).resize(720, 500, { fit: 'contain', background: '#080808' }).png().toBuffer();
  const actualImage = await sharp(actual).resize(720, 500, { fit: 'contain', background: '#080808' }).png().toBuffer();
  await sharp({
    create: { width: 1440, height: 500, channels: 3, background: '#080808' },
  }).composite([{ input: referenceImage, left: 0, top: 0 }, { input: actualImage, left: 720, top: 0 }]).png().toFile(output);
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      const mediaResponses = [];
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      page.on('response', response => {
        if (/\/media\/signature-hoodie\/videos\/.+\.mp4$/.test(new URL(response.url()).pathname)) {
          mediaResponses.push({ url: response.url(), status: response.status() });
        }
      });

      const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
      const overlay = await page.locator('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay').count();
      const hasContent = (await page.locator('body').innerText()).trim().length > 0;
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      await page.locator('#signature-runway').scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);

      const video = page.locator('#signature-runway video');
      await video.waitFor({ state: 'visible' });
      await page.waitForFunction(() => {
        const element = document.querySelector('#signature-runway video');
        return element && element.readyState >= 1;
      });
      const videoState = await video.evaluate(element => ({
        src: new URL(element.currentSrc || element.src).pathname,
        duration: element.duration,
        muted: element.muted,
        loop: element.loop,
        paused: element.paused,
        currentTime: element.currentTime,
      }));
      await page.waitForTimeout(600);
      const videoAdvanced = await video.evaluate(element => element.currentTime > 0);
      const runwayPath = path.join(outputDir, `runway-${viewport.id}.png`);
      await page.locator('#signature-runway').screenshot({ path: runwayPath });

      const controls = {
        pauseMotion: await page.getByRole('button', { name: /pause motion|play motion|replay motion/i }).count(),
        gallery: await page.getByRole('button', { name: /view gallery/i }).count(),
        order: await page.getByRole('button', { name: /^order/i }).count(),
        mobilePurchase: await page.locator('.cp-mobile-purchase-bar').count(),
      };

      await video.evaluate(element => {
        element.currentTime = Math.max(0, element.duration - 0.15);
        return element.play();
      });
      await page.waitForTimeout(400);
      const stoppedAtEnd = await video.evaluate(element => element.ended && element.paused && !element.loop);

      await page.getByRole('button', { name: /view gallery/i }).click();
      await page.locator('#product-media-overlay').waitFor({ state: 'visible' });
      const galleryInitial = {
        firstSlideImage: await page.locator('.cp-media-slide').first().locator('img').count(),
        firstSlideVideo: await page.locator('.cp-media-slide').first().locator('video').count(),
        runwaySelector: await page.getByRole('button', { name: 'Show Runway motion' }).count(),
        fitSelector: await page.getByRole('button', { name: 'Show Fit & silhouette' }).count(),
      };
      const galleryPath = path.join(outputDir, `gallery-factual-${viewport.id}.png`);
      await page.locator('#product-media-overlay').screenshot({ path: galleryPath });

      await page.getByRole('button', { name: 'Show Runway motion' }).click();
      await page.waitForTimeout(500);
      const activeRunwayVideo = await page.locator('.cp-media-slide').filter({ has: page.locator('video[src*="runway-motion-final"]') }).locator('video').count();
      const modalRunwayPath = path.join(outputDir, `gallery-runway-${viewport.id}.png`);
      await page.locator('#product-media-overlay').screenshot({ path: modalRunwayPath });

      await page.getByRole('button', { name: 'Show Fit & silhouette' }).click();
      await page.waitForTimeout(500);
      const activeFitVideo = await page.locator('.cp-media-slide').filter({ has: page.locator('video[src*="fit-silhouette-final"]') }).locator('video').count();
      const modalFitPath = path.join(outputDir, `gallery-fit-${viewport.id}.png`);
      await page.locator('#product-media-overlay').screenshot({ path: modalFitPath });

      results.push({
        viewport,
        status: response?.status(),
        overlay,
        hasContent,
        overflow,
        videoState,
        videoAdvanced,
        stoppedAtEnd,
        controls,
        galleryInitial,
        activeRunwayVideo,
        activeFitVideo,
        consoleErrors,
        mediaResponses,
        failedRequests: failedRequests.filter(item => {
          if (item.url.includes('/_vercel/')) return false;
          const isExpectedNextNavigationAbort = item.error === 'net::ERR_ABORTED'
            && new URL(item.url).searchParams.has('_rsc');
          if (isExpectedNextNavigationAbort) return false;
          const isExpectedCancelledMediaRead = item.error === 'net::ERR_ABORTED'
            && /\/media\/signature-hoodie\/videos\/.+\.mp4$/.test(new URL(item.url).pathname)
            && mediaResponses.some(response => response.url === item.url && [200, 206].includes(response.status));
          return !isExpectedCancelledMediaRead;
        }),
      });
      await context.close();
    }

    const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await reducedPage.locator('#signature-runway').scrollIntoViewIfNeeded();
    await reducedPage.waitForTimeout(500);
    const reducedMotion = await reducedPage.locator('#signature-runway video').evaluate(element => ({ paused: element.paused, currentTime: element.currentTime }));
    await reducedPage.locator('#signature-runway').screenshot({ path: path.join(outputDir, 'runway-mobile-reduced-motion.png') });
    await reducedContext.close();

    const report = {
      schemaVersion: 'cp.uat-final-media.v1',
      baseUrl,
      generatedAt: new Date().toISOString(),
      results,
      reducedMotion,
      assertions: {
        pageHealthy: results.every(item => item.status === 200 && item.overlay === 0 && item.hasContent),
        responsive: results.every(item => item.overflow === false),
        videoContract: results.every(item => item.videoState.src.endsWith('/runway-motion-final.mp4')
          && item.videoState.duration >= 7 && item.videoState.duration <= 8
          && item.videoState.muted && !item.videoState.loop && item.videoAdvanced && item.stoppedAtEnd),
        factualGalleryOpening: results.every(item => item.galleryInitial.firstSlideImage === 1
          && item.galleryInitial.firstSlideVideo === 0
          && item.galleryInitial.runwaySelector === 1
          && item.galleryInitial.fitSelector === 1),
        separateVideos: results.every(item => item.activeRunwayVideo === 1 && item.activeFitVideo === 1),
        reducedMotion: reducedMotion.paused && reducedMotion.currentTime === 0,
        consoleAndNetworkClean: results.every(item => item.consoleErrors.length === 0 && item.failedRequests.length === 0),
        commerceControlsPresent: results.every(item => item.controls.order > 0 && item.controls.mobilePurchase > 0),
      },
    };
    writeFileSync(path.join(outputDir, 'uat-results.json'), `${JSON.stringify(report, null, 2)}\n`);

    await compare(
      '/Users/edv/Documents/Codex/2026-08-16/whe/outputs/product-motion-study-no-count.png',
      path.join(outputDir, 'runway-desktop.png'),
      path.join(outputDir, 'compare-runway-desktop.png'),
    );
    await compare(
      '/Users/edv/Documents/Codex/2026-08-16/whe/outputs/product-motion-study-mobile-no-count.png',
      path.join(outputDir, 'runway-mobile.png'),
      path.join(outputDir, 'compare-runway-mobile.png'),
    );
    await compare(
      '/Users/edv/Documents/Codex/2026-08-16/whe/outputs/product-manual-gallery-no-count.png',
      path.join(outputDir, 'gallery-factual-desktop.png'),
      path.join(outputDir, 'compare-gallery-desktop.png'),
    );

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (Object.entries(report.assertions).some(([key, value]) => key !== 'commerceControlsPresent' && !value)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
