import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.CP_PLAYWRIGHT_PATH);
const sharp = require('sharp');
const outputRoot = path.resolve('test_reports/cp-cicd-bootstrap-2026-08-14');
const screenshotRoot = path.join(outputRoot, 'screenshots');
const comparisonRoot = path.join(outputRoot, 'comparisons');
const targets = [
  { name: 'main', url: 'http://127.0.0.1:3124' },
  { name: 'candidate', url: 'http://127.0.0.1:3125' },
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(screenshotRoot, { recursive: true });
await mkdir(comparisonRoot, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CP_CHROME_EXECUTABLE,
});
const results = [];

try {
  for (const viewport of viewports) {
    for (const target of targets) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
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
        const url = request.url();
        const error = request.failure()?.errorText || 'unknown';
        const isContextClosePrefetchAbort = (
          error === 'net::ERR_ABORTED'
          && url.includes('_rsc')
          && new URL(url).origin === target.url
        );
        if (!isContextClosePrefetchAbort) requestFailures.push({ url, error });
      });

      const response = await page.goto(target.url, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
      });
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      const state = await page.evaluate(() => ({
        contentLength: document.body.innerText.trim().length,
        frameworkOverlay: Boolean(document.querySelector('[data-nextjs-dialog], #webpack-dev-server-client-overlay')),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        imageCount: document.images.length,
        decodedImageCount: [...document.images].filter(image => image.complete && image.naturalWidth > 0).length,
      }));
      const screenshot = path.join(screenshotRoot, `${viewport.name}-${target.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: false });
      results.push({
        viewport,
        target: target.name,
        status: response?.status() || null,
        state,
        consoleErrors,
        pageErrors,
        requestFailures,
        screenshot,
      });
      await context.close();
    }

    const mainPath = path.join(screenshotRoot, `${viewport.name}-main.png`);
    const candidatePath = path.join(screenshotRoot, `${viewport.name}-candidate.png`);
    const main = sharp(mainPath);
    const candidate = sharp(candidatePath);
    const [mainMetadata, candidateMetadata] = await Promise.all([main.metadata(), candidate.metadata()]);
    if (mainMetadata.width !== candidateMetadata.width || mainMetadata.height !== candidateMetadata.height) {
      throw new Error(`Screenshot dimensions differ for ${viewport.name}.`);
    }
    await sharp({
      create: {
        width: mainMetadata.width * 2,
        height: mainMetadata.height,
        channels: 4,
        background: '#000000',
      },
    }).composite([
      { input: mainPath, left: 0, top: 0 },
      { input: candidatePath, left: mainMetadata.width, top: 0 },
    ]).png().toFile(path.join(comparisonRoot, `${viewport.name}-main-candidate.png`));
  }
} finally {
  await browser.close();
}

const pass = results.every(result => (
  result.status === 200
  && result.state.contentLength > 0
  && !result.state.frameworkOverlay
  && !result.state.horizontalOverflow
  && result.state.imageCount === result.state.decodedImageCount
  && result.consoleErrors.length === 0
  && result.pageErrors.length === 0
  && result.requestFailures.length === 0
));

await writeFile(path.join(outputRoot, 'browser-verification.json'), `${JSON.stringify({
  schemaVersion: 'cp.cicd-visual-proof.v1',
  date: '2026-08-14',
  comparison: 'canonical main cd1cd771 vs automation-only candidate',
  runtimeSourceChanged: false,
  pass,
  results,
}, null, 2)}\n`);

if (!pass) process.exitCode = 1;
