import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = '/Users/edv/Documents/cp/test_reports/staging-uat-carlophillips-2026-08-22/live-staging-test';
mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  }).catch(() => chromium.launch({ headless: true }));

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  const report = {
    target: 'https://staging.carlophillips.com',
    testedAt: new Date().toISOString(),
    phases: {},
  };

  console.log('Navigating to https://staging.carlophillips.com/#signature-runway...');
  await page.goto('https://staging.carlophillips.com/#signature-runway', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to ensure the hero section is in view
  const heroSection = page.locator('#signature-runway');
  await heroSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // 1. Check Video 1 (Runway motion)
  const video1State = await page.evaluate(() => {
    const video = document.querySelector('#signature-runway video');
    return video ? {
      found: true,
      src: video.currentSrc || video.src,
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      muted: video.muted,
      readyState: video.readyState,
    } : { found: false };
  });

  console.log('Video 1 state on landing:', video1State);
  report.phases.video1 = video1State;
  await page.screenshot({ path: join(outDir, '01-live-staging-video1-runway.png') });

  // Let video 1 play for 2 seconds to confirm progress
  await page.waitForTimeout(2000);
  const video1After2s = await page.evaluate(() => {
    const video = document.querySelector('#signature-runway video');
    return video ? {
      paused: video.paused,
      currentTime: video.currentTime,
    } : null;
  });
  report.phases.video1After2s = video1After2s;
  console.log('Video 1 after 2s playback:', video1After2s);

  // Fast forward Video 1 to near end (7.0s) to observe transition to Video 2
  await page.evaluate(() => {
    const video = document.querySelector('#signature-runway video');
    if (video) video.currentTime = Math.max(0, video.duration - 0.5);
  });
  await page.waitForTimeout(1800);

  // 2. Check Video 2 (Fit & silhouette)
  const video2State = await page.evaluate(() => {
    const video = document.querySelector('#signature-runway video');
    const img = document.querySelector('#signature-runway img.cp-runway-live-motion');
    return {
      hasVideo: Boolean(video),
      videoSrc: video ? (video.currentSrc || video.src) : null,
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
      hasSpinImage: Boolean(img),
      imgSrc: img ? img.src : null,
    };
  });
  console.log('Phase 2 state:', video2State);
  report.phases.phase2 = video2State;
  await page.screenshot({ path: join(outDir, '02-live-staging-phase2-fit-silhouette.png') });

  // Let Video 2 play or advance to Phase 3
  if (video2State.hasVideo) {
    await page.evaluate(() => {
      const video = document.querySelector('#signature-runway video');
      if (video && video.duration) video.currentTime = Math.max(0, video.duration - 0.5);
    });
    await page.waitForTimeout(1800);
  }

  // 3. Check Phase 3 (360 spin animation)
  const phase3State = await page.evaluate(() => {
    const video = document.querySelector('#signature-runway video');
    const img = document.querySelector('#signature-runway img.cp-runway-live-motion');
    const statusText = document.querySelector('.cp-motion-status')?.textContent?.trim();
    return {
      hasVideo: Boolean(video),
      hasSpinImage: Boolean(img),
      imgSrc: img ? img.src : null,
      statusText,
    };
  });
  console.log('Phase 3 (360 spin) state:', phase3State);
  report.phases.phase3 = phase3State;
  await page.screenshot({ path: join(outDir, '03-live-staging-phase3-360-spin.png') });

  writeFileSync(join(outDir, 'live-staging-video-test-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log('Live staging video test completed. Report saved.');
}

run().catch(console.error);
