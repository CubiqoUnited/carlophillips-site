import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const target = process.env.CP_VIDEO_QA_TARGET || 'https://staging.carlophillips.com/';
const observeSeconds = Number(process.env.CP_OBSERVE_SECONDS || 45);
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: process.env.CP_REDUCED_MOTION === 'reduce' ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('requestfailed', request => failedRequests.push({ url: request.url(), reason: request.failure()?.errorText }));

await page.addInitScript(() => {
  window.__cpMediaEvents = [];
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function wrappedPlay(...args) {
    const source = this.currentSrc || this.getAttribute('src');
    window.__cpMediaEvents.push({ event: 'play-call', source, at: performance.now(), paused: this.paused });
    const result = originalPlay.apply(this, args);
    result?.then?.(
      () => window.__cpMediaEvents.push({ event: 'play-resolved', source, at: performance.now(), paused: this.paused }),
      error => window.__cpMediaEvents.push({ event: 'play-rejected', source, at: performance.now(), name: error.name, message: error.message })
    );
    return result;
  };
  for (const event of ['playing', 'pause', 'ended', 'waiting', 'stalled', 'error', 'loadedmetadata', 'canplay']) {
    document.addEventListener(event, ({ target }) => {
      if (!(target instanceof HTMLMediaElement)) return;
      window.__cpMediaEvents.push({
        event,
        source: target.currentSrc || target.getAttribute('src'),
        at: performance.now(),
        paused: target.paused,
        currentTime: target.currentTime,
        readyState: target.readyState,
        networkState: target.networkState,
      });
    }, true);
  }
});

await page.goto(target, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(1500);
await page.locator('#signature-runway').scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const sample = label => page.evaluate(labelValue => {
  const video = document.querySelector('.cp-stage-video');
  const stage = document.querySelector('.cp-stage');
  const rect = stage?.getBoundingClientRect();
  return {
    label: labelValue,
    stageState: stage?.getAttribute('data-stage-state'),
    stageRect: rect ? { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
    source: video?.getAttribute('src'),
    paused: video?.paused,
    muted: video?.muted,
    autoplay: video?.autoplay,
    currentTime: video?.currentTime,
    duration: video?.duration,
    readyState: video?.readyState,
    controls: [...document.querySelectorAll('.cp-stage-control')].map(button => ({
      label: button.getAttribute('aria-label'),
      visible: Boolean(button.getClientRects().length),
    })),
    replay: Boolean(document.querySelector('.cp-stage-resume')),
  };
}, label);

const samples = [await sample('after-navigation')];
for (let seconds = 5; seconds <= observeSeconds; seconds += 5) {
  await page.waitForTimeout(5000);
  samples.push(await sample(`${seconds}s`));
}

await page.screenshot({ path: path.join(outputDir, 'after-real-sequence.png'), fullPage: false });
const mediaEvents = await page.evaluate(() => window.__cpMediaEvents);
const result = { target, samples, mediaEvents, consoleErrors, failedRequests };
await fs.writeFile(path.join(outputDir, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
