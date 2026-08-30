import { chromium } from '/Users/edv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'https://staging.carlophillips.com';
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const surfaces = [
  { name: 'product', path: '/products/carlophillips-signature-hoodie' },
  { name: 'bag', path: '/bag' },
  { name: 'checkout', path: '/checkout' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--disable-background-networking', '--disable-component-update'],
});

const report = {
  schemaVersion: 'cp.malti-staging-baseline.v1',
  target: baseUrl,
  capturedAt: new Date().toISOString(),
  commit: '7db1898bcfd13e56d12104ec5fcdcb1027d7650b',
  staticFixtureCommerceProof: false,
  viewports: {},
};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'no-preference',
    locale: 'en-US',
  });
  report.viewports[viewport.name] = {};

  for (const surface of surfaces) {
    const page = await context.newPage();
    const consoleMessages = [];
    const pageErrors = [];
    const requestFailures = [];
    const errorResponses = [];

    page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) {
        consoleMessages.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => {
      requestFailures.push({
        method: request.method(),
        url: request.url(),
        error: request.failure()?.errorText ?? null,
      });
    });
    page.on('response', response => {
      if (response.status() >= 400) {
        errorResponses.push({
          status: response.status(),
          url: response.url(),
          resourceType: response.request().resourceType(),
        });
      }
    });

    const requestedUrl = `${baseUrl}${surface.path}`;
    const navigationResponse = await page.goto(requestedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1_500);

    const dom = await page.evaluate(() => {
      const visible = element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const clean = value => value?.replace(/\s+/g, ' ').trim() ?? '';
      const controls = [...document.querySelectorAll('button, a, input[type="submit"]')]
        .filter(visible)
        .map(element => ({
          tag: element.tagName.toLowerCase(),
          text: clean(element.innerText || element.value || element.getAttribute('aria-label')),
          href: element instanceof HTMLAnchorElement ? element.getAttribute('href') : null,
          enabled: !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true',
          type: element.getAttribute('type'),
        }))
        .filter(control => control.text || control.href);
      const forms = [...document.forms].map(form => ({
        action: form.getAttribute('action'),
        method: (form.getAttribute('method') || 'get').toLowerCase(),
        submitLabels: [...form.querySelectorAll('button, input[type="submit"]')].map(element =>
          clean(element.innerText || element.value || element.getAttribute('aria-label')),
        ),
      }));
      const media = [...document.querySelectorAll('img, video')].map(element => ({
        tag: element.tagName.toLowerCase(),
        src: element.currentSrc || element.getAttribute('src'),
        alt: element.getAttribute('alt'),
        visible: visible(element),
        complete: element instanceof HTMLImageElement ? element.complete : undefined,
        naturalWidth: element instanceof HTMLImageElement ? element.naturalWidth : undefined,
        readyState: element instanceof HTMLVideoElement ? element.readyState : undefined,
        paused: element instanceof HTMLVideoElement ? element.paused : undefined,
      }));
      const bodyText = clean(document.body.innerText);
      const purchaseSignals = [
        'Continue to checkout',
        'Add to bag',
        'Add to cart',
        'Purchasing disabled',
        'Selection disabled',
        'Checkout unavailable',
        'blocked',
        'denied',
        'draft',
        'preview',
        'Shopify',
      ].filter(signal => bodyText.toLowerCase().includes(signal.toLowerCase()));
      return {
        title: document.title,
        url: location.href,
        headings: [...document.querySelectorAll('h1, h2, h3')].filter(visible).map(element => clean(element.innerText)),
        bodyText,
        purchaseSignals,
        controls,
        forms,
        media,
        layout: {
          innerWidth,
          innerHeight,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        },
      };
    });

    const screenshot = `${viewport.name}-${surface.name}.png`;
    await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true });
    report.viewports[viewport.name][surface.name] = {
      requestedUrl,
      navigationStatus: navigationResponse?.status() ?? null,
      screenshot,
      dom,
      consoleMessages,
      pageErrors,
      requestFailures,
      errorResponses,
    };
    await page.close();
  }

  await context.close();
}

await browser.close();
await fs.writeFile(path.join(outputDir, 'browser-evidence.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  target: report.target,
  capturedAt: report.capturedAt,
  surfaces: Object.fromEntries(
    Object.entries(report.viewports).map(([viewport, results]) => [
      viewport,
      Object.fromEntries(
        Object.entries(results).map(([surface, result]) => [
          surface,
          {
            status: result.navigationStatus,
            title: result.dom.title,
            signals: result.dom.purchaseSignals,
            controls: result.dom.controls,
            horizontalOverflow: result.dom.layout.horizontalOverflow,
            consoleMessages: result.consoleMessages.length,
            pageErrors: result.pageErrors.length,
            requestFailures: result.requestFailures.length,
            errorResponses: result.errorResponses.length,
          },
        ]),
      ),
    ]),
  ),
}, null, 2));
