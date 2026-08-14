import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';

const baseUrl = process.env.CP_QA_BASE_URL || 'http://127.0.0.1:3100';
const token = process.env.CP_ADMIN_REVIEW_TOKEN;
const ownerToken = process.env.CP_ADMIN_PRODUCT_OWNER_TOKEN;
const reportRoot = path.resolve(process.env.CP_QA_REPORT_DIR || 'test_reports/cp-e2e-admin-control-plane-2026-08-14');
const screenshotRoot = path.join(reportRoot, 'screenshots');
const candidateState = process.env.CP_QA_CANDIDATE_STATE || 'working-tree';

if (!token || token.length < 32) throw new Error('CP_ADMIN_REVIEW_TOKEN must contain at least 32 characters.');
if (!ownerToken || ownerToken.length < 32) throw new Error('CP_ADMIN_PRODUCT_OWNER_TOKEN must contain at least 32 characters.');
if (ownerToken === token) throw new Error('Admin reviewer and Product Owner tokens must be distinct.');

const viewports = [
  { id: 'desktop-1440x1000', width: 1440, height: 1000 },
  { id: 'tablet-1024x768', width: 1024, height: 768 },
  { id: 'mobile-390x844', width: 390, height: 844 },
];
const sections = [
  ['overview', '/admin'],
  ['evidence', '/admin/evidence'],
  ['drops', '/admin/drops'],
  ['runs', '/admin/runs'],
  ['products', '/admin/products'],
  ['media', '/admin/media'],
  ['releases', '/admin/releases'],
  ['approvals', '/admin/approvals'],
  ['commands', '/admin/commands'],
  ['publication', '/admin/publication'],
  ['orders', '/admin/orders'],
  ['post-sale', '/admin/post-sale'],
  ['analytics', '/admin/analytics'],
  ['capabilities', '/admin/capabilities'],
  ['audit', '/admin/audit'],
];
const publicRoutes = ['/', '/shop', '/products/carlophillips-signature-hoodie', '/bag'];
const publicViewports = viewports.filter(viewport => viewport.id !== 'tablet-1024x768');
const findings = [];
const failures = [];
const canonicalThemePath = path.resolve('theme.json');

await fs.mkdir(screenshotRoot, { recursive: true });
await fs.mkdir(path.join(reportRoot, 'comparisons'), { recursive: true });

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
      check(await page.locator('meta[name="robots"]').evaluateAll(elements => elements.some(element => element.content.includes('noindex'))), 'Admin metadata is noindex.', { viewport: viewport.id, route });
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
      check(await page.getByRole('link', { name: 'Theme', exact: true }).count() === 0, 'Reviewer navigation hides Product Owner Theme.', { viewport: viewport.id, route });

      if (section === 'evidence') {
        check(pageState.bodyText.includes('Evidence is not authority'), 'Evidence screen states the technical-evidence authority boundary.', { viewport: viewport.id });
        check(pageState.bodyText.includes('STALE_AUTH_BLOCKER_SUPERSEDED'), 'Evidence screen marks the historical Shopify authentication blocker superseded.', { viewport: viewport.id });
        check(pageState.bodyText.includes('CART_ACTIVATION_AUTHORITY_REQUIRED'), 'Evidence screen keeps the historical cart test activation-blocked.', { viewport: viewport.id });
      }
      if (section === 'orders') check(pageState.bodyText.includes('No controlled order exists.'), 'Orders screen exposes a truthful canonical empty state.', { viewport: viewport.id });
      if (section === 'post-sale') check(pageState.bodyText.includes('No post-sale case exists.'), 'Post-sale screen exposes a truthful canonical empty state.', { viewport: viewport.id });
      if (section === 'analytics') check(pageState.bodyText.includes('No approved analytics ledger exists.'), 'Analytics screen exposes a truthful canonical empty state.', { viewport: viewport.id });
      if (section === 'audit') check(pageState.bodyText.includes('durable hash-chained audit is not implemented'), 'Audit screen disclaims durable append-only persistence.', { viewport: viewport.id });
      if (section === 'capabilities') {
        const cartRowText = await page.getByRole('row').filter({ hasText: 'shopify-storefront-cart' }).innerText();
        check(/write[-_ ]test[-_ ]verified/i.test(cartRowText) && cartRowText.includes('CART_ACTIVATION_AUTHORITY_REQUIRED') && /blocked/i.test(cartRowText), 'Capabilities screen separates cart technical access from operating authority.', { viewport: viewport.id, cartRowText });
      }

      if (viewport.id === 'mobile-390x844') {
        check(await page.getByText('Scroll navigation for more sections →', { exact: true }).isVisible(), 'Mobile navigation exposes a visible horizontal-scroll affordance.', { route });
        const auditNav = page.getByRole('link', { name: 'Audit history', exact: true });
        await auditNav.scrollIntoViewIfNeeded();
        const auditNavBox = await auditNav.boundingBox();
        check(Boolean(auditNavBox) && auditNavBox.x >= 0 && auditNavBox.x + auditNavBox.width <= viewport.width + 1, 'Mobile navigation can reveal the final section without viewport overflow.', { route, auditNavBox });
      }

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

    const ownerContext = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      extraHTTPHeaders: { Authorization: `Bearer ${ownerToken}` },
      reducedMotion: 'reduce',
    });
    const ownerPage = await ownerContext.newPage();
    const ownerConsoleErrors = [];
    const ownerRequestFailures = [];
    ownerPage.on('console', message => {
      if (message.type() === 'error') ownerConsoleErrors.push(message.text());
    });
    ownerPage.on('requestfailed', request => ownerRequestFailures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    const ownerResponse = await ownerPage.goto(`${baseUrl}/admin/theme`, { waitUntil: 'networkidle' });
    check(ownerResponse?.status() === 200, 'Product Owner Theme route returns HTTP 200.', { viewport: viewport.id, status: ownerResponse?.status() });
    check(await ownerPage.getByRole('heading', { name: 'Exactly four token values. No layout changes.' }).isVisible(), 'Theme first viewport states the exact token-only boundary.', { viewport: viewport.id });
    check(await ownerPage.locator('form').count() === 1, 'Theme contains one bounded proposal form.', { viewport: viewport.id });
    check(await ownerPage.locator('input[type="color"], select').count() === 4, 'Theme exposes exactly four value controls.', { viewport: viewport.id });
    check(await ownerPage.getByRole('button', { name: 'Save branch proposal' }).isDisabled(), 'Unchanged Theme proposal cannot be saved.', { viewport: viewport.id });
    check(await ownerPage.getByText('Local repo proposal only. Production is unchanged; QA, pull request, Preview, review, and merge remain separate.').isVisible(), 'Theme warning states local proposal and unchanged Production.', { viewport: viewport.id });
    check(await ownerPage.getByText('branch proposal', { exact: true }).isVisible(), 'Theme status is branch proposal, not the product release state.', { viewport: viewport.id });

    const themeNav = ownerPage.getByRole('link', { name: 'Theme', exact: true });
    await themeNav.scrollIntoViewIfNeeded();
    const themeNavBox = await themeNav.boundingBox();
    check(Boolean(themeNavBox) && themeNavBox.x < viewport.width && themeNavBox.x + themeNavBox.width > 0, 'Theme navigation remains visibly discoverable at this viewport.', { viewport: viewport.id, themeNavBox });
    await themeNav.focus();
    check(await themeNav.evaluate(element => element === document.activeElement), 'Theme navigation accepts keyboard focus.', { viewport: viewport.id });

    await ownerPage.screenshot({ path: path.join(screenshotRoot, `${viewport.id}-theme-default.png`), fullPage: true });

    await ownerPage.getByLabel('Corner radius').selectOption('0.5rem');
    check(await ownerPage.getByRole('button', { name: 'Save branch proposal' }).isEnabled(), 'A valid changed proposal enables the honest save action.', { viewport: viewport.id });
    const previewRadius = await ownerPage.locator('[aria-label="Proposed token preview"] > div').first().evaluate(element => getComputedStyle(element).borderRadius);
    check(previewRadius === '8px', 'Contained preview reflects the proposed radius without a repository write.', { viewport: viewport.id, previewRadius });
    const themeState = await ownerPage.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      text: document.body.innerText,
    }));
    check(!themeState.overflow, 'Theme route has no horizontal viewport overflow.', { viewport: viewport.id });
    check(!/(gid:\/\/shopify|9432704909549|5958463)/i.test(themeState.text), 'Theme route exposes no raw Shopify or POD reference.', { viewport: viewport.id });
    const themeAccessibility = await new AxeBuilder({ page: ownerPage }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const themeSerious = themeAccessibility.violations.filter(violation => ['critical', 'serious'].includes(violation.impact));
    check(themeSerious.length === 0, 'Theme has no critical or serious automated accessibility violations.', { viewport: viewport.id, violations: themeSerious.map(violation => violation.id) });
    await ownerPage.screenshot({ path: path.join(screenshotRoot, `${viewport.id}-theme.png`), fullPage: true });
    check(ownerConsoleErrors.length === 0, 'Theme emits no console errors.', { viewport: viewport.id, ownerConsoleErrors });
    check(ownerRequestFailures.length === 0, 'Theme has no failed requests.', { viewport: viewport.id, ownerRequestFailures });
    await ownerContext.close();
  }

  const deniedContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const deniedPage = await deniedContext.newPage();
  const deniedResponse = await deniedPage.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
  check(deniedResponse?.status() === 404, 'Unauthenticated admin request is indistinguishable from a missing page.', { status: deniedResponse?.status() });
  check(!/(control plane|release|shopify|pod|approval)/i.test(await deniedPage.locator('body').innerText()), 'Denied response exposes no operational vocabulary.', {});
  await deniedPage.screenshot({ path: path.join(screenshotRoot, 'denied-1024x768.png'), fullPage: true });
  await deniedContext.close();

  const reviewerThemeContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
  const reviewerThemePage = await reviewerThemeContext.newPage();
  const reviewerThemeResponse = await reviewerThemePage.goto(`${baseUrl}/admin/theme`, { waitUntil: 'networkidle' });
  check(reviewerThemeResponse?.status() === 404, 'Reviewer direct Theme request is indistinguishable from a missing page.', { status: reviewerThemeResponse?.status() });
  check(!/(theme\.json|accent colour|corner radius|base spacing|text weight)/i.test(await reviewerThemePage.locator('body').innerText()), 'Reviewer denial exposes no Theme values or vocabulary.', {});
  await reviewerThemePage.screenshot({ path: path.join(screenshotRoot, 'reviewer-theme-denied-1024x768.png'), fullPage: true });
  await reviewerThemeContext.close();

  const publicConsoleErrors = [];
  const publicRequestFailures = [];
  for (const viewport of publicViewports) {
    const publicContext = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    const publicPage = await publicContext.newPage();
    publicPage.on('console', message => {
      if (message.type() === 'error') publicConsoleErrors.push(`${viewport.id}: ${message.text()}`);
    });
    publicPage.on('requestfailed', request => {
      const failure = request.failure()?.errorText;
      const expectedNavigationAbort = failure === 'net::ERR_ABORTED' && request.url().includes('_rsc=');
      if (!expectedNavigationAbort) publicRequestFailures.push(`${viewport.id}: ${request.method()} ${request.url()}: ${failure}`);
    });
    for (const route of publicRoutes) {
      const response = await publicPage.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      check(response?.status() === 200, 'Public regression route returns HTTP 200.', { viewport: viewport.id, route, status: response?.status() });
      await publicPage.evaluate(async () => {
        const pageHeight = document.documentElement.scrollHeight;
        for (let offset = 0; offset < pageHeight; offset += window.innerHeight) {
          window.scrollTo(0, offset);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
        await Promise.all([...document.images].map(image => image.decode().catch(() => null)));
        window.scrollTo(0, 0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const publicState = await publicPage.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        adminLinks: [...document.querySelectorAll('a')].filter(link => link.getAttribute('href')?.startsWith('/admin')).length,
        bodyText: document.body.innerText,
        brokenImages: [...document.images]
          .filter(image => image.currentSrc && (!image.complete || image.naturalWidth === 0))
          .map(image => image.currentSrc),
      }));
      check(!publicState.overflow, 'Public regression route has no horizontal overflow.', { viewport: viewport.id, route });
      check(publicState.adminLinks === 0, 'Public regression route contains no admin navigation.', { viewport: viewport.id, route });
      check(!/(gid:\/\/shopify|shopify|modelize|apliiq|9432704909549|5958463)/i.test(publicState.bodyText), 'Public regression route exposes no provider name or raw provider reference.', { viewport: viewport.id, route });
      check(publicState.brokenImages.length === 0, 'Public regression route has no broken decoded images.', { viewport: viewport.id, route, brokenImages: publicState.brokenImages });
      const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
      await publicPage.screenshot({ path: path.join(screenshotRoot, `public-${viewport.id}-${slug}.png`), fullPage: false });
    }
    await publicContext.close();
  }
  check(publicConsoleErrors.length === 0, 'Public regression route matrix emits no console errors.', { consoleErrors: publicConsoleErrors });
  check(publicRequestFailures.length === 0, 'Public regression route matrix has no failed requests.', { requestFailures: publicRequestFailures });

  const apiContext = await browser.newContext();
  const themeBefore = await fs.readFile(canonicalThemePath, 'utf8');
  const currentTheme = JSON.parse(themeBefore);
  const expectedFingerprint = `sha256:${createHash('sha256').update(themeBefore).digest('hex')}`;
  const unchangedThemeResponse = await apiContext.request.post(`${baseUrl}/api/admin/theme`, {
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      Origin: new URL(baseUrl).origin,
    },
    data: { expectedFingerprint, theme: currentTheme },
  });
  const unchangedThemePayload = await unchangedThemeResponse.json();
  check(unchangedThemeResponse.status() === 200, 'Same-origin Product Owner Theme POST accepts the unchanged canonical proposal.', { status: unchangedThemeResponse.status() });
  check(unchangedThemePayload.code === 'THEME_UNCHANGED', 'Unchanged Theme POST returns THEME_UNCHANGED.', { code: unchangedThemePayload.code });
  check(await fs.readFile(canonicalThemePath, 'utf8') === themeBefore, 'Unchanged Theme POST leaves the canonical file byte-for-byte unchanged.', {});

  const rejectedOriginResponse = await apiContext.request.post(`${baseUrl}/api/admin/theme`, {
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      Origin: 'https://denied.example',
    },
    data: { expectedFingerprint, theme: currentTheme },
  });
  const rejectedOriginPayload = await rejectedOriginResponse.json();
  check(rejectedOriginResponse.status() === 403, 'Cross-origin Product Owner Theme POST is denied.', { status: rejectedOriginResponse.status() });
  check(rejectedOriginPayload.code === 'ORIGIN_REJECTED', 'Cross-origin Theme denial names the origin gate.', { code: rejectedOriginPayload.code });
  check(await fs.readFile(canonicalThemePath, 'utf8') === themeBefore, 'Rejected-origin Theme POST leaves the canonical file byte-for-byte unchanged.', {});

  const checkoutResponse = await apiContext.request.post(`${baseUrl}/api/checkout`, {
    form: {
      handle: 'carlophillips-signature-hoodie',
      referenceHash: `sha256:${'a'.repeat(64)}`,
      quantity: '1',
    },
  });
  const checkoutPayload = await checkoutResponse.json();
  check(checkoutResponse.status() === 409, 'Checkout endpoint denies the canonical Draft release.', { status: checkoutResponse.status() });
  check(checkoutPayload.error === 'PRODUCT_RELEASE_NOT_RELEASED', 'Checkout denial names the canonical release-state gate.', { error: checkoutPayload.error });
  await apiContext.close();
} finally {
  await browser.close();
}

async function labelledThumbnail(file, label, width, height) {
  const image = await sharp(file)
    .resize({ width, height: height - 32, fit: 'contain', position: 'top', background: '#050505' })
    .png()
    .toBuffer();
  const safeLabel = label.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const labelImage = Buffer.from(`<svg width="${width}" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111111"/><text x="12" y="21" fill="#f1f0ec" font-family="Arial, sans-serif" font-size="12">${safeLabel}</text></svg>`);
  return sharp({ create: { width, height, channels: 3, background: '#050505' } })
    .composite([{ input: image, top: 0, left: 0 }, { input: labelImage, top: height - 32, left: 0 }])
    .png()
    .toBuffer();
}

const responsiveWidth = 360;
const responsiveHeight = 820;
const responsiveInputs = await Promise.all(viewports.map(async viewport => ({
  input: await labelledThumbnail(
    path.join(screenshotRoot, `${viewport.id}-overview.png`),
    viewport.id,
    responsiveWidth,
    responsiveHeight,
  ),
})));
await sharp({
  create: {
    width: responsiveWidth * responsiveInputs.length,
    height: responsiveHeight,
    channels: 3,
    background: '#020202',
  },
})
  .composite(responsiveInputs.map((input, index) => ({ ...input, top: 0, left: index * responsiveWidth })))
  .png()
  .toFile(path.join(reportRoot, 'comparisons', 'admin-overview-responsive.png'));

const gridWidth = 300;
const gridHeight = 250;
const gridColumns = 4;
const gridRows = Math.ceil(sections.length / gridColumns);
const gridInputs = await Promise.all(sections.map(async ([section]) => ({
  input: await labelledThumbnail(
    path.join(screenshotRoot, `desktop-1440x1000-${section}.png`),
    section,
    gridWidth,
    gridHeight,
  ),
})));
await sharp({
  create: {
    width: gridWidth * gridColumns,
    height: gridHeight * gridRows,
    channels: 3,
    background: '#020202',
  },
})
  .composite(gridInputs.map((input, index) => ({
    ...input,
    top: Math.floor(index / gridColumns) * gridHeight,
    left: (index % gridColumns) * gridWidth,
  })))
  .png()
  .toFile(path.join(reportRoot, 'comparisons', 'admin-sections-desktop-contact-sheet.png'));

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
  candidateState,
  browser: 'Playwright Chromium headless',
  visibility: 'background; no focus or foreground window',
  viewports,
  sections: sections.map(([id, route]) => ({ id, route })),
  comparisons: ['comparisons/admin-overview-responsive.png', 'comparisons/admin-sections-desktop-contact-sheet.png'],
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
  console.log(JSON.stringify({ passed: true, findingCount: findings.length, screenshotCount: (viewports.length * (sections.length + 2)) + 2 + (publicRoutes.length * publicViewports.length) }, null, 2));
}
