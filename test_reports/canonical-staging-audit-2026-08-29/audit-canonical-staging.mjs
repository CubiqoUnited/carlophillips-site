import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const target = 'https://staging.carlophillips.com/';
const outputDir = path.dirname(new URL(import.meta.url).pathname);

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    requestFailures.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' });
  });

  await page.goto(target, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(6_000);

  const before = await page.evaluate(() => {
    const rect = (element) => {
      if (!(element instanceof HTMLElement)) return null;
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const images = [...document.images].map((image) => ({
      alt: image.alt,
      src: image.currentSrc || image.src,
      srcset: image.srcset,
      sizes: image.sizes,
      nimg: image.getAttribute('data-nimg'),
      rendered: rect(image),
      natural: { width: image.naturalWidth, height: image.naturalHeight },
    }));
    const videos = [...document.querySelectorAll('video')].map((video) => ({
      src: video.currentSrc || video.src,
      preload: video.preload,
      autoplay: video.autoplay,
      muted: video.muted,
      playsInline: video.playsInline,
      rendered: rect(video),
    }));
    return {
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      ogType: document.querySelector('meta[property="og:type"]')?.content ?? null,
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      images,
      videos,
      buttons: [...document.querySelectorAll('button')].map((button) => button.textContent?.trim()).filter(Boolean),
      links: [...document.querySelectorAll('a')].map((link) => link.textContent?.trim()).filter(Boolean),
    };
  });

  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}-canonical-before-gallery.png`),
    fullPage: false,
  });

  const galleryTrigger = page.getByRole('button', { name: /view gallery/i }).first();
  const triggerCount = await galleryTrigger.count();
  let gallery = null;

  if (triggerCount > 0) {
    await galleryTrigger.click();
    await page.waitForTimeout(1_000);

    gallery = await page.evaluate(() => {
      const rect = (element) => {
        if (!(element instanceof HTMLElement)) return null;
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      };
      const visible = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
      };
      const dialog = [...document.querySelectorAll('[role="dialog"], dialog, [aria-modal="true"]')].find(visible) ?? null;
      const galleryRoot = dialog ?? [...document.querySelectorAll('[class*="gallery"], [class*="overlay"]')].reverse().find(visible) ?? null;
      const root = galleryRoot ?? document.body;
      const buttons = [...root.querySelectorAll('button')].filter(visible);
      const images = [...root.querySelectorAll('img')].filter(visible);
      const filterNames = ['ALL', 'SAME-MODEL', 'MERCHANDISE', 'DETAIL', '2.5D VIEWER'];
      const rootText = root.textContent ?? '';
      return {
        dialog: rect(dialog),
        root: rect(galleryRoot),
        text: rootText.replace(/\s+/g, ' ').trim().slice(0, 2_000),
        buttonCount: buttons.length,
        buttons: buttons.map((button) => ({
          text: button.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          ariaLabel: button.getAttribute('aria-label'),
          disabled: button.disabled,
          opacity: getComputedStyle(button).opacity,
          rect: rect(button),
        })),
        imageCount: images.length,
        images: images.map((image) => ({
          alt: image.alt,
          src: image.currentSrc || image.src,
          srcset: image.srcset,
          sizes: image.sizes,
          rect: rect(image),
          aspectRatio: getComputedStyle(image).aspectRatio,
        })),
        filters: filterNames.filter((name) => rootText.toUpperCase().includes(name)),
      };
    });

    await page.screenshot({
      path: path.join(outputDir, `${viewport.name}-canonical-gallery.png`),
      fullPage: false,
    });
  }

  results.push({
    viewport,
    url: page.url(),
    before,
    galleryTriggerCount: triggerCount,
    gallery,
    consoleErrors,
    requestFailures,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'canonical-staging-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
