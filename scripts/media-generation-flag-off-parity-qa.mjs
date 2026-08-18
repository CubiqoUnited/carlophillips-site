import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baselineUrl = process.env.CP_QA_BASELINE_URL || 'http://127.0.0.1:3140';
const candidateUrl = process.env.CP_QA_CANDIDATE_URL || 'http://127.0.0.1:3141';
const outputDir = path.resolve(process.env.CP_QA_OUTPUT_DIR || 'test_reports/cp-admin-media-generation-2026-08-18/flag-off-parity');
const ownerToken = process.env.CP_QA_OWNER_TOKEN;
if (!ownerToken) throw new Error('CP_QA_OWNER_TOKEN is required.');

const cases = [
  { name: 'home-desktop', route: '/', width: 1440, height: 1000, auth: false },
  { name: 'home-mobile', route: '/', width: 390, height: 844, auth: false },
  { name: 'media-registry-desktop', route: '/admin/media', width: 1440, height: 1000, auth: true },
  { name: 'media-registry-mobile', route: '/admin/media', width: 390, height: 844, auth: true },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

async function capture(baseUrl, label, testCase) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    extraHTTPHeaders: testCase.auth ? { Authorization: `Bearer ${ownerToken}` } : {},
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => failedRequests.push(request.url()));
  const response = await page.goto(`${baseUrl}${testCase.route}`, { waitUntil: 'networkidle' });
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    mediaGenerationVisible: document.body.innerText.includes('Media Generation'),
  }));
  const unexpectedFailedRequests = failedRequests.filter(url => {
    const parsed = new URL(url);
    return !(parsed.searchParams.has('_rsc') && ['/bag', '/shop'].includes(parsed.pathname));
  });
  const screenshotPath = path.join(outputDir, `${testCase.name}-${label}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await context.close();
  return { screenshotPath, status: response?.status() || null, consoleErrors, failedRequests, unexpectedFailedRequests, ...state };
}

for (const testCase of cases) {
  const baseline = await capture(baselineUrl, 'baseline', testCase);
  const candidate = await capture(candidateUrl, 'candidate', testCase);
  const baselineImage = sharp(baseline.screenshotPath).ensureAlpha();
  const candidateImage = sharp(candidate.screenshotPath).ensureAlpha();
  const [baselineMeta, candidateMeta] = await Promise.all([baselineImage.metadata(), candidateImage.metadata()]);
  let differentBytes = null;
  let totalBytes = null;
  if (baselineMeta.width === candidateMeta.width && baselineMeta.height === candidateMeta.height) {
    const [baselinePixels, candidatePixels] = await Promise.all([
      baselineImage.raw().toBuffer(),
      candidateImage.raw().toBuffer(),
    ]);
    totalBytes = baselinePixels.length;
    differentBytes = baselinePixels.reduce((count, value, index) => count + (value === candidatePixels[index] ? 0 : 1), 0);
  }
  results.push({
    case: testCase,
    baseline: { ...baseline, screenshotPath: path.relative(outputDir, baseline.screenshotPath) },
    candidate: { ...candidate, screenshotPath: path.relative(outputDir, candidate.screenshotPath) },
    dimensionsMatch: baselineMeta.width === candidateMeta.width && baselineMeta.height === candidateMeta.height,
    differentBytes,
    totalBytes,
    byteDifferenceRatio: totalBytes ? differentBytes / totalBytes : null,
  });
}

const denialContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  extraHTTPHeaders: { Authorization: `Bearer ${ownerToken}` },
});
const denialPage = await denialContext.newPage();
const denialResponse = await denialPage.goto(`${candidateUrl}/admin/media-generation`, { waitUntil: 'networkidle' });
await denialPage.screenshot({ path: path.join(outputDir, 'media-generation-feature-off-denied.png'), fullPage: true });
await denialContext.close();
await browser.close();

const failures = results.filter(result => (
  result.baseline.status !== 200
  || result.candidate.status !== 200
  || result.baseline.overflow
  || result.candidate.overflow
  || result.baseline.overlay
  || result.candidate.overlay
  || result.baseline.consoleErrors.length
  || result.candidate.consoleErrors.length
  || result.baseline.unexpectedFailedRequests.length
  || result.candidate.unexpectedFailedRequests.length
  || result.candidate.mediaGenerationVisible
  || !result.dimensionsMatch
  || result.differentBytes !== 0
));
const report = {
  schemaVersion: 'cp.media-generation-flag-off-parity.v1',
  baselineUrl,
  candidateUrl,
  generatedAt: new Date().toISOString(),
  featureOffRouteStatus: denialResponse?.status() || null,
  passed: failures.length === 0 && denialResponse?.status() === 404,
  results,
  failures,
};
await writeFile(path.join(outputDir, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
