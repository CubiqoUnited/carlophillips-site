import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.CP_QA_BASE_URL || 'http://127.0.0.1:3100';
const token = process.env.CP_ADMIN_REVIEW_TOKEN;
const reportRoot = path.resolve(process.env.CP_QA_REPORT_DIR || 'test_reports/cp-e2e-admin-control-plane-2026-08-14');
const screenshotRoot = path.join(reportRoot, 'screenshots');

if (!token || token.length < 32) throw new Error('CP_ADMIN_REVIEW_TOKEN must contain at least 32 characters.');

const viewports = [
  { id: 'desktop-1440x1000', width: 1440, height: 1000 },
  { id: 'tablet-1024x768', width: 1024, height: 768 },
  { id: 'mobile-390x844', width: 390, height: 844 },
];
const sections = [
  ['overview', '/admin'],
  ['drops', '/admin/drops'],
  ['runs', '/admin/runs'],
  ['products', '/admin/products'],
  ['media', '/admin/media'],
  ['releases', '/admin/releases'],
  ['approvals', '/admin/approvals'],
  ['publication', '/admin/publication'],
  ['orders', '/admin/orders'],
  ['post-sale', '/admin/post-sale'],
  ['analytics', '/admin/analytics'],
  ['capabilities', '/admin/capabilities'],
  ['audit', '/admin/audit'],
];
const publicRoutes = ['/', '/shop', '/products/carlophillips-signature-hoodie', '/bag'];
const findings = [];
const failures = [];

await fs.mkdir(screenshotRoot, { recursive: true });

function check(condition, message, context = {}) {
  findings.push({ passed: Boolean(condition), message, ...context });
  if (!condition) failures.push({ message, ...context });
}

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
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

    for (const [section, route] of sections) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      check(response?.status() === 200, 'Authorized admin route returns HTTP 200.', { viewport: viewport.id, route, status: response?.status() });
      check(await page.locator('meta[name="robots"]').getAttribute('content').then(value => value?.includes('noindex')), 'Admin metadata is noindex.', { viewport: viewport.id, route });
      check(await page.locator('form').count() === 0, 'Read-only admin contains no forms.', { viewport: viewport.id, route });
      check(await page.locator('button').count() === 0, 'Read-only admin contains no buttons.', { viewport: viewport.id, route });

      const pageState = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        bodyText: document.body.innerText,
        activeNav: document.querySelector('nav a[aria-current="page"]')?.textContent?.trim() || null,
      }));
      check(!pageState.overflow, 'Admin route has no horizontal viewport overflow.', { viewport: viewport.id, route });
      check(!/(gid:\/\/shopify|9432704909549|5958463)/i.test(pageState.bodyText), 'Admin route exposes no raw Shopify or POD reference.', { viewport: viewport.id, route });
      check(Boolean(pageState.activeNav), 'Admin route exposes a labelled active navigation state.', { viewport: viewport.id, route });

      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = accessibility.violations.filter(violation => ['critical', 'serious'].includes(violation.impact));
      check(serious.length === 0, 'Admin route has no critical or serious automated accessibility violations.', {
        viewport: viewport.id,
        route,
        violations: serious.map(violation => violation.id),
      });

      await page.screenshot({ path: path.join(screenshotRoot, `${viewport.id}-${section}.png`), fullPage: true });
    }

    check(consoleErrors.length === 0, 'Admin route matrix emits no console errors.', { viewport: viewport.id, consoleErrors });
    check(requestFailures.length === 0, 'Admin route matrix has no failed requests.', { viewport: viewport.id, requestFailures });
    await context.close();
  }

  const deniedContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const deniedPage = await deniedContext.newPage();
  const deniedResponse = await deniedPage.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  check(deniedResponse?.status() === 404, 'Unauthenticated admin request is indistinguishable from a missing page.', { status: deniedResponse?.status() });
  check(!/(control plane|release|shopify|pod|approval)/i.test(await deniedPage.locator('body').innerText()), 'Denied response exposes no operational vocabulary.', {});
  await deniedPage.screenshot({ path: path.join(screenshotRoot, 'denied-1024x768.png'), fullPage: true });
  await deniedContext.close();

  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const publicPage = await publicContext.newPage();
  const publicConsoleErrors = [];
  publicPage.on('console', message => {
    if (message.type() === 'error') publicConsoleErrors.push(message.text());
  });
  for (const route of publicRoutes) {
    const response = await publicPage.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    check(response?.status() === 200, 'Public regression route returns HTTP 200.', { route, status: response?.status() });
    const publicState = await publicPage.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      adminLinks: [...document.querySelectorAll('a')].filter(link => link.getAttribute('href')?.startsWith('/admin')).length,
    }));
    check(!publicState.overflow, 'Public regression route has no horizontal overflow.', { route });
    check(publicState.adminLinks === 0, 'Public regression route contains no admin navigation.', { route });
    await publicPage.screenshot({ path: path.join(screenshotRoot, `public-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`), fullPage: false });
  }
  check(publicConsoleErrors.length === 0, 'Public regression route matrix emits no console errors.', { consoleErrors: publicConsoleErrors });

  const checkoutResponse = await publicContext.request.post(`${baseUrl}/api/checkout`, {
    form: {
      handle: 'carlophillips-signature-hoodie',
      referenceHash: `sha256:${'a'.repeat(64)}`,
      quantity: '1',
    },
  });
  const checkoutPayload = await checkoutResponse.json();
  check(checkoutResponse.status() === 409, 'Checkout endpoint denies the canonical Draft release.', { status: checkoutResponse.status() });
  check(checkoutPayload.error === 'PRODUCT_RELEASE_NOT_RELEASED', 'Checkout denial names the canonical release-state gate.', { error: checkoutPayload.error });
  await publicContext.close();
} finally {
  await browser.close();
}

let gitCommit = null;
try {
  gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  gitCommit = 'unavailable';
}

const report = {
  schemaVersion: 'cp.admin-visual-qa.v1',
  capturedAt: new Date().toISOString(),
  baseUrl,
  gitCommit,
  candidateState: 'working-tree',
  browser: 'Playwright Chromium headless',
  visibility: 'background; no focus or foreground window',
  viewports,
  sections: sections.map(([id, route]) => ({ id, route })),
  publicRoutes,
  passed: failures.length === 0,
  findingCount: findings.length,
  failures,
  findings,
};

await fs.writeFile(path.join(reportRoot, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);

if (failures.length) {
  console.error(JSON.stringify({ passed: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ passed: true, findingCount: findings.length, screenshotCount: (viewports.length * sections.length) + 1 + publicRoutes.length }, null, 2));
}
