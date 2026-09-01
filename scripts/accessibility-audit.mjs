import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = process.env.CP_A11Y_BASE_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.CP_A11Y_OUTPUT_DIR || 'test_reports/production-customer-experience-2026-08-14';
const routes = ['/', '/shop', '/products/carlophillips-signature-hoodie', '/bag', '/privacy', '/terms', '/cookie-policy'];
const viewports = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }];
const browser = await chromium.launch({ headless: true });
const results = [];

await mkdir(`${outputDir}/screenshots`, { recursive: true });
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    const analyticsRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (/google-analytics|googletagmanager|facebook\.net|tiktok/i.test(request.url())) analyticsRequests.push(request.url()); });
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const slug = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-/, '');
    await page.screenshot({ path: `${outputDir}/screenshots/${slug}-${viewport.name}.png`, fullPage: true });
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const consentButtons = await page.locator('.cp-consent button').allTextContents();
    results.push({ route, viewport: viewport.name, status: response?.status(), title: await page.title(), canonical: await page.locator('link[rel="canonical"]').getAttribute('href'), robots: await page.locator('meta[name="robots"]').getAttribute('content'), consentButtons, analyticsRequests, horizontalOverflow, violations: audit.violations, consoleErrors: errors });
    await page.close();
  }
  await context.close();
}
await browser.close();
await writeFile(`${outputDir}/accessibility-verification.json`, JSON.stringify(results, null, 2));

const failures = results.filter((result) => result.status !== 200 || result.consoleErrors.length || result.violations.length || result.analyticsRequests.length || result.horizontalOverflow || result.consentButtons.length !== 0);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Accessibility audit passed for ${results.length} route/viewport combinations.`);
}
