import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.dirname(new URL(import.meta.url).pathname);
const target =
  process.env.CP_VIDEO_QA_TARGET ??
  'http://127.0.0.1:3100/#signature-runway';
const expected = {
  first: 'mIfRL7Bs4dKarRfC7T01DZjseBjZbQdn3TP39liDmdSc',
  second: '1WVN1VPKqCIBMb8hW7R5g5gn01nFOltivagIy1Rjr5y8',
};
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
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(target, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('#signature-runway').scrollIntoViewIfNeeded();
  await page.waitForSelector('.cp-workbook-product-video');
  await page.waitForTimeout(3_000);
  await page
    .waitForFunction(
      () => {
        const video = document.querySelector('.cp-workbook-product-video');
        return video && !video.paused && video.currentTime > 0.25;
      },
      undefined,
      { timeout: 12_000 }
    )
    .catch(() => undefined);

  const inspect = () =>
    page.evaluate(() => {
      const video = document.querySelector('.cp-workbook-product-video');
      const controls = document.querySelector('.cp-workbook-video-controls');
      const progress = controls?.querySelector('progress');
      const selectorButtons = [
        ...(document.querySelectorAll('.cp-workbook-video-selector button') ?? []),
      ];
      const replay = document.querySelector('.cp-workbook-centered-play');
      const playControl = controls?.querySelector('button');
      const rect = (element) => {
        if (!(element instanceof HTMLElement)) return null;
        const box = element.getBoundingClientRect();
        return { width: box.width, height: box.height };
      };
      return {
        playbackId:
          video?.getAttribute('playback-id') ??
          video?.getAttribute('playbackid') ??
          video?.playbackId ??
          null,
        muted: video?.muted ?? null,
        paused: video?.paused ?? null,
        currentTime: video?.currentTime ?? null,
        autoplay: video?.autoplay ?? null,
        playsInline: video?.playsInline ?? null,
        controlColor: controls
          ? getComputedStyle(playControl).color
          : null,
        playControlLabel: playControl?.getAttribute('aria-label') ?? null,
        progressColor: progress
          ? getComputedStyle(progress, '::-webkit-progress-value').backgroundColor
          : null,
        progressToken: progress
          ? getComputedStyle(progress)
              .getPropertyValue('--cp-component-product-progress-color')
              .trim()
          : null,
        selectorCount: selectorButtons.length,
        selectorDisabled: selectorButtons.map((button) => button.disabled),
        selectorColors: selectorButtons.map(
          (button) => getComputedStyle(button).backgroundColor
        ),
        replayVisible: Boolean(replay),
        replayRect: rect(replay),
        replayColor: replay ? getComputedStyle(replay).color : null,
        replayBorderColor: replay
          ? getComputedStyle(replay).borderColor
          : null,
      };
    });

  const first = await inspect();
  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}-product-video-first.png`),
    fullPage: false,
  });

  const sequence = [first];
  for (let completion = 0; completion < 4; completion += 1) {
    await page
      .waitForFunction(
        () => {
          const video = document.querySelector('.cp-workbook-product-video');
          return video && !video.paused && video.currentTime > 0.1;
        },
        undefined,
        { timeout: 12_000 }
      )
      .catch(() => undefined);
    await page.locator('.cp-workbook-product-video').evaluate((video) => {
      video.dispatchEvent(new Event('ended'));
    });
    const expectedPlaybackId =
      completion === 0 || completion === 2
        ? expected.second
        : completion === 1
          ? expected.first
          : null;
    if (expectedPlaybackId) {
      await page
        .waitForFunction(
          (playbackId) => {
            const video = document.querySelector('.cp-workbook-product-video');
            return (
              video?.getAttribute('playback-id') === playbackId ||
              video?.getAttribute('playbackid') === playbackId ||
              video?.playbackId === playbackId
            );
          },
          expectedPlaybackId,
          { timeout: 12_000 }
        )
        .catch(() => undefined);
    } else {
      await page
        .waitForSelector('.cp-workbook-centered-play', { timeout: 5_000 })
        .catch(() => undefined);
    }
    await page.waitForTimeout(750);
    sequence.push(await inspect());
  }

  const final = sequence.at(-1);
  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}-product-video-complete.png`),
    fullPage: false,
  });

  const assertions = {
    startsWithFit: first.playbackId === expected.first,
    mutedAutoplay:
      first.muted === true &&
      first.autoplay === 'muted' &&
      first.paused === false &&
      first.currentTime > 0.25,
    advancesToRunway: sequence[1]?.playbackId === expected.second,
    repeatsFromFit: sequence[2]?.playbackId === expected.first,
    repeatsRunway: sequence[3]?.playbackId === expected.second,
    stopsWithReplay:
      final?.replayVisible === true && final?.playControlLabel === 'Play motion',
    creamControls: first.controlColor === 'rgb(231, 224, 210)',
    greenProgressToken:
      first.progressToken === '#00a63b' ||
      first.progressToken === 'rgb(0, 166, 59)',
    threePositionDashes: first.selectorCount === 3,
    thirdPositionUnavailable: first.selectorDisabled?.[2] === true,
  };

  results.push({ viewport, first, sequence, final, assertions, errors });
  await context.close();
}

await browser.close();

const allPassed = results.every((result) =>
  Object.values(result.assertions).every(Boolean)
);
await fs.writeFile(
  path.join(outputDir, 'product-video-candidate-results.json'),
  JSON.stringify({ allPassed, results }, null, 2)
);
console.log(JSON.stringify({ allPassed, results }, null, 2));
if (!allPassed) process.exitCode = 1;
