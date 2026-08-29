import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const target = process.env.CP_VIDEO_QA_TARGET || 'http://127.0.0.1:3200/#signature-runway';
const expected = {
  first: '/media/signature-hoodie/videos/fit-silhouette-final.mp4',
  second: '/media/signature-hoodie/videos/runway-motion-final.mp4',
};
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(target, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('#signature-runway').scrollIntoViewIfNeeded();
  await page.waitForSelector('.cp-stage-video');
  await page.waitForFunction(() => {
    const video = document.querySelector('.cp-stage-video');
    return video && !video.paused && video.muted && video.currentTime > 0.25;
  }, undefined, { timeout: 15_000 });

  const inspect = () => page.evaluate(() => {
    const video = document.querySelector('.cp-stage-video');
    const controls = [...document.querySelectorAll('.cp-stage-control')];
    const dashes = [...document.querySelectorAll('.cp-stage-dash')];
    const replay = document.querySelector('.cp-stage-resume');
    const replayRect = replay?.getBoundingClientRect();
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      source: video?.getAttribute('src') || null,
      muted: video?.muted ?? null,
      paused: video?.paused ?? null,
      currentTime: video?.currentTime ?? null,
      autoplay: video?.autoplay ?? null,
      playsInline: video?.playsInline ?? null,
      controlColors: controls.map(control => getComputedStyle(control).color),
      progressToken: rootStyle.getPropertyValue('--cp-component-product-progress-color').trim(),
      controlToken: rootStyle.getPropertyValue('--cp-component-product-control-color').trim(),
      dashCount: dashes.length,
      dashDisabled: dashes.map(dash => dash.disabled),
      dashColors: dashes.map(dash => getComputedStyle(dash).backgroundColor),
      replayVisible: Boolean(replay),
      replayRect: replayRect ? { width: replayRect.width, height: replayRect.height } : null,
      replayColor: replay ? getComputedStyle(replay).color : null,
      replayBorderColor: replay ? getComputedStyle(replay).borderColor : null,
    };
  });

  const first = await inspect();
  await page.screenshot({ path: path.join(outputDir, `${viewport.name}-first.png`) });

  const sequence = [first];
  for (let completion = 0; completion < 4; completion += 1) {
    await page.waitForFunction(() => {
      const video = document.querySelector('.cp-stage-video');
      return video && !video.paused && video.currentTime > 0.1;
    }, undefined, { timeout: 15_000 });
    await page.locator('.cp-stage-video').evaluate(video => video.dispatchEvent(new Event('ended')));

    const nextExpected = completion === 0 || completion === 2
      ? expected.second
      : completion === 1
        ? expected.first
        : null;
    if (nextExpected) {
      await page.waitForFunction(source => document.querySelector('.cp-stage-video')?.getAttribute('src') === source,
        nextExpected, { timeout: 15_000 });
    } else {
      await page.waitForSelector('.cp-stage-resume', { timeout: 15_000 });
    }
    await page.waitForTimeout(500);
    sequence.push(await inspect());
  }

  const final = sequence.at(-1);
  await page.screenshot({ path: path.join(outputDir, `${viewport.name}-complete.png`) });
  const assertions = {
    startsWithFit: first.source === expected.first,
    mutedAutoplay: first.muted === true && first.autoplay === true && first.paused === false && first.currentTime > 0.25,
    advancesToRunway: sequence[1]?.source === expected.second,
    repeatsFromFit: sequence[2]?.source === expected.first,
    repeatsRunway: sequence[3]?.source === expected.second,
    holdsFinalReplay: final?.source === expected.second && final?.replayVisible === true,
    creamControls: first.controlToken === '#e7e0d2' && first.controlColors.every(color => color === 'rgb(231, 224, 210)'),
    greenProgress: first.progressToken === '#00a63b',
    threePositions: first.dashCount === 3 && first.dashDisabled[2] === true,
    creamReplay: final?.replayColor === 'rgb(231, 224, 210)'
      && final?.replayBorderColor === 'rgb(231, 224, 210)'
      && final?.replayRect?.width === 120
      && final?.replayRect?.height === 120,
  };

  results.push({ viewport, first, sequence, final, assertions, errors });
  await context.close();
}

await browser.close();
const allPassed = results.every(result => Object.values(result.assertions).every(Boolean) && result.errors.length === 0);
await fs.writeFile(path.join(outputDir, 'results.json'), JSON.stringify({ target, allPassed, results }, null, 2));
console.log(JSON.stringify({ target, allPassed, results }, null, 2));
if (!allPassed) process.exitCode = 1;
