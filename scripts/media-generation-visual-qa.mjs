import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.CP_QA_BASE_URL || 'http://127.0.0.1:3141';
const outputDir = path.resolve(process.env.CP_QA_OUTPUT_DIR || 'test_reports/cp-admin-media-generation-2026-08-18');
const ownerToken = process.env.CP_QA_OWNER_TOKEN;
const reviewerToken = process.env.CP_QA_REVIEWER_TOKEN;

if (!ownerToken || !reviewerToken) throw new Error('CP_QA_OWNER_TOKEN and CP_QA_REVIEWER_TOKEN are required.');

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(path.join(outputDir, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    extraHTTPHeaders: { Authorization: `Bearer ${ownerToken}` },
    reducedMotion: viewport.name === 'mobile' ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));
  const response = await page.goto(`${baseUrl}/admin/media-generation`, { waitUntil: 'networkidle' });
  const check = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent?.trim() || '',
    contentLength: document.body.innerText.trim().length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
    mediaNavCurrent: document.querySelector('a[aria-current="page"]')?.textContent?.trim() || '',
    actionButtons: [...document.querySelectorAll('button')].map(button => ({ label: button.textContent.trim(), disabled: button.disabled })),
    truthLabels: document.body.innerText.toLowerCase().includes('ai editorial · draft only'),
    boundary: document.body.innerText.includes('The existing POD-to-publish funnel remains unchanged.'),
  }));
  await page.screenshot({ path: path.join(outputDir, 'screenshots', `media-generation-${viewport.name}.png`), fullPage: true });
  results.push({
    viewport,
    status: response?.status() || null,
    ...check,
    consoleErrors,
    failedRequests,
  });
  await context.close();
}

for (const access of [
  { name: 'reviewer-denied', token: reviewerToken },
  { name: 'anonymous-denied', token: null },
]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    extraHTTPHeaders: access.token ? { Authorization: `Bearer ${access.token}` } : {},
  });
  const page = await context.newPage();
  const response = await page.goto(`${baseUrl}/admin/media-generation`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputDir, 'screenshots', `${access.name}.png`), fullPage: true });
  results.push({
    access: access.name,
    status: response?.status() || null,
    title: await page.locator('h1').first().textContent().catch(() => null),
  });
  await context.close();
}

await browser.close();

const failures = results.filter(result => result.viewport && (
  result.status !== 200
  || result.title !== 'Media Generation'
  || result.contentLength < 500
  || result.overflow
  || result.overlay
  || result.mediaNavCurrent !== 'Media Generation'
  || !result.boundary
  || !result.truthLabels
  || result.actionButtons.length !== 6
  || result.actionButtons.filter(button => button.label !== 'Compare').some(button => !button.disabled)
  || result.consoleErrors.length
  || result.failedRequests.length
));
const denialFailures = results.filter(result => result.access && result.status !== 404);

const report = {
  schemaVersion: 'cp.media-generation-visual-qa.v1',
  baseUrl,
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0 && denialFailures.length === 0,
  results,
  failures,
  denialFailures,
};
await writeFile(path.join(outputDir, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
