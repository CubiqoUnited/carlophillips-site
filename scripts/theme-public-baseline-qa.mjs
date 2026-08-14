import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baselineUrl = process.env.CP_QA_BASELINE_URL;
const candidateUrl = process.env.CP_QA_CANDIDATE_URL;
const baselineCommit = process.env.CP_QA_BASELINE_COMMIT || 'f566ef7';
const candidateState = process.env.CP_QA_CANDIDATE_STATE || 'working-tree';
const reportRoot = path.resolve(
  process.env.CP_QA_REPORT_DIR || 'test_reports/cp-admin-theme-tokens-2026-08-14'
);
if (!baselineUrl || !candidateUrl) {
  throw new Error('CP_QA_BASELINE_URL and CP_QA_CANDIDATE_URL are required.');
}

const routes = ['/', '/shop', '/products/carlophillips-signature-hoodie', '/bag'];
const viewports = [
  { id: 'desktop-1440x1000', width: 1440, height: 1000 },
  { id: 'mobile-390x844', width: 390, height: 844 },
];
const baselineRoot = path.join(reportRoot, `baseline-${baselineCommit.replaceAll(/[^a-zA-Z0-9._-]/g, '-')}`);
const candidateRoot = path.join(reportRoot, 'comparison-candidate');
await fs.mkdir(baselineRoot, { recursive: true });
await fs.mkdir(candidateRoot, { recursive: true });

function slugFor(route) {
  return route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function captureSurface(browser, label, baseUrl, outputRoot) {
  const results = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestFailures = [];
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', request => {
      const failure = request.failure()?.errorText;
      const expectedNavigationAbort = failure === 'net::ERR_ABORTED' && request.url().includes('_rsc=');
      if (!expectedNavigationAbort) requestFailures.push(`${request.method()} ${request.url()}: ${failure}`);
    });

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => (
          image.complete ? Promise.resolve() : new Promise(resolve => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
        )));
      });
      const structure = await page.evaluate(() => {
        const rectangle = selector => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const value = element.getBoundingClientRect();
          return Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, Math.round(value[key] * 100) / 100]));
        };
        const bodyStyle = getComputedStyle(document.body);
        const inertRuntimeTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE']);
        const tree = [...document.body.querySelectorAll('*')]
          .filter(element => !inertRuntimeTags.has(element.tagName))
          .map(element => ({
            tag: element.tagName.toLowerCase(),
            id: element.id || null,
            className: typeof element.className === 'string' ? element.className : null,
            role: element.getAttribute('role'),
            ariaLabel: element.getAttribute('aria-label'),
          }));
        return {
          tree,
          elementCount: tree.length,
          governedHeadBridgeCount: document.head.querySelectorAll('style[data-cp-theme-tokens="theme.json"]').length,
          bodyText: document.body.innerText.replace(/\s+/g, ' ').trim(),
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          documentWidth: document.documentElement.scrollWidth,
          bodyStyle: {
            backgroundColor: bodyStyle.backgroundColor,
            color: bodyStyle.color,
            fontFamily: bodyStyle.fontFamily,
            fontSize: bodyStyle.fontSize,
            fontWeight: bodyStyle.fontWeight,
          },
          rectangles: {
            header: rectangle('header'),
            main: rectangle('main'),
            h1: rectangle('h1'),
            footer: rectangle('footer'),
          },
        };
      });
      const treeHash = sha256(JSON.stringify(structure.tree));
      const textHash = sha256(structure.bodyText);
      delete structure.tree;
      delete structure.bodyText;
      const screenshot = path.join(outputRoot, `${viewport.id}-${slugFor(route)}.png`);
      await page.screenshot({ path: screenshot, fullPage: false });
      results.push({
        label,
        viewport: viewport.id,
        route,
        status: response?.status() || null,
        screenshot,
        treeHash,
        textHash,
        ...structure,
      });
    }
    results.push({ label, viewport: viewport.id, consoleErrors, requestFailures });
    await context.close();
  }
  return results;
}

async function comparePngs(baselinePath, candidatePath) {
  const baseline = await sharp(baselinePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const candidate = await sharp(candidatePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sameDimensions = baseline.info.width === candidate.info.width
    && baseline.info.height === candidate.info.height
    && baseline.info.channels === candidate.info.channels;
  if (!sameDimensions) {
    return { sameDimensions: false, baseline: baseline.info, candidate: candidate.info };
  }
  let absoluteDifference = 0;
  let changedPixels = 0;
  const pixelCount = baseline.info.width * baseline.info.height;
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    let pixelChanged = false;
    for (let channel = 0; channel < 3; channel += 1) {
      const offset = (pixel * baseline.info.channels) + channel;
      const difference = Math.abs(baseline.data[offset] - candidate.data[offset]);
      absoluteDifference += difference;
      if (difference > 8) pixelChanged = true;
    }
    if (pixelChanged) changedPixels += 1;
  }
  return {
    sameDimensions: true,
    width: baseline.info.width,
    height: baseline.info.height,
    meanAbsoluteChannelDifference: absoluteDifference / (pixelCount * 3),
    changedPixelPercentageAtThreshold8: (changedPixels / pixelCount) * 100,
  };
}

const browser = await chromium.launch({ headless: true });
let baseline;
let candidate;
try {
  baseline = await captureSurface(browser, baselineCommit, baselineUrl, baselineRoot);
  candidate = await captureSurface(browser, candidateState, candidateUrl, candidateRoot);
} finally {
  await browser.close();
}

const comparisons = [];
for (const viewport of viewports) {
  for (const route of routes) {
    const baselineEntry = baseline.find(item => item.viewport === viewport.id && item.route === route);
    const candidateEntry = candidate.find(item => item.viewport === viewport.id && item.route === route);
    const baselinePath = path.join(baselineRoot, `${viewport.id}-${slugFor(route)}.png`);
    const candidatePath = path.join(candidateRoot, `${viewport.id}-${slugFor(route)}.png`);
    comparisons.push({
      viewport: viewport.id,
      route,
      statusEqual: baselineEntry.status === candidateEntry.status && candidateEntry.status === 200,
      structureHashEqual: baselineEntry.treeHash === candidateEntry.treeHash,
      textHashEqual: baselineEntry.textHash === candidateEntry.textHash,
      elementCountEqual: baselineEntry.elementCount === candidateEntry.elementCount,
      governedHeadBridgeExpected: baselineEntry.governedHeadBridgeCount === 0
        && candidateEntry.governedHeadBridgeCount === 1,
      bodyStyleEqual: JSON.stringify(baselineEntry.bodyStyle) === JSON.stringify(candidateEntry.bodyStyle),
      rectanglesEqual: JSON.stringify(baselineEntry.rectangles) === JSON.stringify(candidateEntry.rectangles),
      noOverflow: !baselineEntry.overflow && !candidateEntry.overflow,
      pixel: await comparePngs(baselinePath, candidatePath),
    });
  }
}

const diagnosticFailures = [...baseline, ...candidate]
  .filter(item => item.consoleErrors?.length || item.requestFailures?.length);
const passed = comparisons.every(item => (
  item.statusEqual
  && item.structureHashEqual
  && item.textHashEqual
  && item.elementCountEqual
  && item.governedHeadBridgeExpected
  && item.bodyStyleEqual
  && item.rectanglesEqual
  && item.noOverflow
  && item.pixel.sameDimensions
)) && diagnosticFailures.length === 0;

const report = {
  schemaVersion: 'cp.theme-public-baseline-qa.v1',
  capturedAt: new Date().toISOString(),
  browser: 'Playwright Chromium headless',
  visibility: 'background; no focus or foreground window',
  baseline: { commit: baselineCommit, url: baselineUrl },
  candidate: { state: candidateState, url: candidateUrl },
  viewports,
  routes,
  passed,
  diagnosticFailures,
  comparisons,
  captures: { baseline, candidate },
};
await fs.writeFile(
  path.join(reportRoot, 'public-baseline-comparison.json'),
  `${JSON.stringify(report, null, 2)}\n`
);
console.log(JSON.stringify({ passed, comparisons }, null, 2));
if (!passed) process.exitCode = 1;
