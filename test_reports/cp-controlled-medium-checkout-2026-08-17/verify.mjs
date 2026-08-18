import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

const baseUrl = process.env.CP_QA_BASE_URL || 'http://127.0.0.1:3135';
const ownerToken = process.env.CP_ADMIN_PRODUCT_OWNER_TOKEN;
const reviewerToken = process.env.CP_ADMIN_REVIEW_TOKEN;
const reportRoot = path.resolve('test_reports/cp-controlled-medium-checkout-2026-08-17');
const screenshotRoot = path.join(reportRoot, 'screenshots');
const viewports = [
  { id: 'desktop-1440x1000', width: 1440, height: 1000 },
  { id: 'mobile-390x844', width: 390, height: 844 },
];
const findings = [];
const failures = [];

if (!ownerToken || !reviewerToken || ownerToken === reviewerToken) {
  throw new Error('Distinct local Product Owner and reviewer tokens are required.');
}

await mkdir(screenshotRoot, { recursive: true });

function check(condition, message, evidence = {}) {
  const finding = { passed: Boolean(condition), message, ...evidence };
  findings.push(finding);
  if (!condition) failures.push(finding);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    const ownerContext = await browser.newContext({
      viewport,
      extraHTTPHeaders: { Authorization: `Bearer ${ownerToken}` },
      reducedMotion: 'reduce',
    });
    const ownerPage = await ownerContext.newPage();
    const consoleErrors = [];
    const requestFailures = [];
    ownerPage.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    ownerPage.on('requestfailed', request => requestFailures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    const ownerResponse = await ownerPage.goto(`${baseUrl}/admin/orders`, { waitUntil: 'networkidle' });
    const button = ownerPage.getByRole('button', { name: 'Open controlled Shopify checkout' });
    const state = await ownerPage.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      overlay: Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')),
      contentLength: document.body.innerText.trim().length,
      rawReference: /(gid:\/\/shopify|9432704909549|5958463)/i.test(document.body.innerText),
    }));
    check(ownerResponse?.status() === 200, 'Product Owner Orders route returns HTTP 200.', { viewport: viewport.id, status: ownerResponse?.status() });
    check(await button.count() === 1, 'Product Owner sees exactly one controlled checkout action.', { viewport: viewport.id });
    check(await ownerPage.getByText('No charge or order occurs by opening checkout.', { exact: true }).isVisible(), 'The action discloses that opening checkout cannot charge or order.', { viewport: viewport.id });
    check(await ownerPage.getByText('Preparing the controlled checkout creates one temporary Shopify cart.', { exact: false }).isVisible(), 'The Orders warning truthfully discloses the temporary Shopify cart mutation.', { viewport: viewport.id });
    check(await ownerPage.getByText('Uses the existing CARLOPHILLIPS → Shopify → Apliiq route.', { exact: false }).isVisible(), 'The selected existing order path is explained.', { viewport: viewport.id });
    check(!state.overflow, 'Product Owner Orders route has no horizontal overflow.', { viewport: viewport.id });
    check(!state.overlay && state.contentLength > 0, 'Product Owner Orders route renders meaningful content without an error overlay.', { viewport: viewport.id });
    check(!state.rawReference, 'Product Owner Orders route exposes no raw Shopify or provider reference.', { viewport: viewport.id });
    const axe = await new AxeBuilder({ page: ownerPage }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = axe.violations.filter(violation => ['critical', 'serious'].includes(violation.impact));
    check(serious.length === 0, 'Product Owner Orders route has no critical or serious automated accessibility violations.', { viewport: viewport.id, violations: serious.map(item => item.id) });
    check(consoleErrors.length === 0, 'Product Owner Orders route emits no console errors.', { viewport: viewport.id, consoleErrors });
    check(requestFailures.length === 0, 'Product Owner Orders route has no failed requests.', { viewport: viewport.id, requestFailures });
    await ownerPage.screenshot({ path: path.join(screenshotRoot, `${viewport.id}-owner-orders.png`), fullPage: true });
    await ownerContext.close();

    const reviewerContext = await browser.newContext({
      viewport,
      extraHTTPHeaders: { Authorization: `Bearer ${reviewerToken}` },
      reducedMotion: 'reduce',
    });
    const reviewerPage = await reviewerContext.newPage();
    const reviewerResponse = await reviewerPage.goto(`${baseUrl}/admin/orders`, { waitUntil: 'networkidle' });
    check(reviewerResponse?.status() === 200, 'Reviewer retains read-only Orders visibility.', { viewport: viewport.id, status: reviewerResponse?.status() });
    check(await reviewerPage.getByRole('button', { name: 'Open controlled Shopify checkout' }).count() === 0, 'Reviewer cannot see the Product Owner action.', { viewport: viewport.id });
    check(await reviewerPage.locator('form[action="/api/admin/controlled-order"]').count() === 0, 'Reviewer receives no controlled-order form.', { viewport: viewport.id });
    await reviewerPage.screenshot({ path: path.join(screenshotRoot, `${viewport.id}-reviewer-orders.png`), fullPage: true });
    await reviewerContext.close();
  }

  const anonymousContext = await browser.newContext();
  const anonymousResponse = await anonymousContext.request.post(`${baseUrl}/api/admin/controlled-order`, {
    headers: { Origin: new URL(baseUrl).origin },
  });
  check(anonymousResponse.status() === 404, 'Anonymous controlled-order POST is concealed as not found.', { status: anonymousResponse.status() });

  const ownerContext = await browser.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${ownerToken}` },
  });
  const crossOriginResponse = await ownerContext.request.post(`${baseUrl}/api/admin/controlled-order`, {
    headers: { Origin: 'https://attacker.example' },
  });
  check(crossOriginResponse.status() === 403, 'Cross-origin Product Owner POST is denied.', { status: crossOriginResponse.status() });
  check((await crossOriginResponse.json()).error === 'ORIGIN_REJECTED', 'Cross-origin denial names the origin boundary.', {});
  await ownerContext.close();
  await anonymousContext.close();
} finally {
  await browser.close();
}

const contactWidth = 390;
const contactHeight = 844;
const images = await Promise.all(viewports.map(async viewport => ({
  input: await sharp(path.join(screenshotRoot, `${viewport.id}-owner-orders.png`))
    .resize({ width: contactWidth, height: contactHeight, fit: 'contain', background: '#050505' })
    .png()
    .toBuffer(),
})));
await sharp({
  create: {
    width: contactWidth * images.length,
    height: contactHeight,
    channels: 3,
    background: '#050505',
  },
}).composite(images.map((input, index) => ({ ...input, left: index * contactWidth, top: 0 })))
  .png()
  .toFile(path.join(reportRoot, 'owner-orders-responsive-comparison.png'));

const report = {
  schemaVersion: 'cp.controlled-medium-checkout-qa.v1',
  capturedAt: new Date().toISOString(),
  story: 'Product Owner Orders action -> protected same-origin POST -> fixed one-Medium Shopify checkout preparation; no payment/order submission and no public checkout activation.',
  baseUrl,
  browser: 'Playwright Chromium headless',
  visibility: 'background; no focus or foreground window',
  viewports,
  passed: failures.length === 0,
  findings,
  failures,
};
await writeFile(path.join(reportRoot, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(path.join(reportRoot, 'report.md'), `# Controlled Medium checkout QA\n\n- Result: ${report.passed ? 'PASS' : 'FAIL'}\n- Browser: ${report.browser}\n- Visibility: ${report.visibility}\n- Findings: ${findings.length}\n- Failures: ${failures.length}\n- Story: ${report.story}\n\nThe action was not clicked and no Shopify cart, checkout, payment, order, fulfillment, deployment, or Production mutation occurred.\n`);

console.log(JSON.stringify({ passed: report.passed, findings: findings.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
