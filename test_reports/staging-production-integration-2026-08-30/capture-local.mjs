import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = 'http://127.0.0.1:3000';
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const routes = [
  { name: 'home', path: '/' },
  {
    name: 'product',
    path: '/product/carlophillips-signature-hoodie',
  },
  { name: 'checkout-rehearsal', path: '/checkout/confirm?mode=preview' },
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
const evidence = {
  schemaVersion: 'cp.integration-visual-qa.v1',
  target: baseUrl,
  capturedAt: new Date().toISOString(),
  mode: 'local-fixture-layout-only',
  viewports: {},
};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    locale: 'en-US',
  });
  evidence.viewports[viewport.name] = {};

  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const error = request.failure()?.errorText || null;
      if (error === 'net::ERR_ABORTED') return;
      requestFailures.push({ url: request.url(), error });
    });

    const response = await page.goto(`${baseUrl}${route.path}`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });
    const dom = await page.evaluate(() => ({
      title: document.title,
      bodyLength: document.body.innerText.trim().length,
      headings: [...document.querySelectorAll('h1, h2')]
        .map((element) => element.textContent?.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
      controls: [...document.querySelectorAll('a, button, input')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none';
        })
        .map((element) =>
          (element.textContent || element.getAttribute('aria-label') || '')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(Boolean),
      errorOverlay: Boolean(
        document.querySelector(
          '[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay'
        )
      ),
      horizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    }));
    const screenshot = `${viewport.name}-${route.name}.png`;
    await page.screenshot({
      path: path.join(outputDir, screenshot),
      fullPage: true,
    });
    evidence.viewports[viewport.name][route.name] = {
      status: response?.status() || null,
      screenshot,
      dom,
      consoleErrors,
      pageErrors,
      requestFailures,
    };
    await page.close();
  }
  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(outputDir, 'local-browser-evidence.json'),
  `${JSON.stringify(evidence, null, 2)}\n`
);

const failures = Object.values(evidence.viewports)
  .flatMap((routesForViewport) => Object.values(routesForViewport))
  .filter(
    (result) =>
      result.status !== 200 ||
      result.dom.bodyLength === 0 ||
      result.dom.errorOverlay ||
      result.dom.horizontalOverflow ||
      result.consoleErrors.length > 0 ||
      result.pageErrors.length > 0 ||
      result.requestFailures.length > 0
  );

console.log(
  JSON.stringify(
    {
      capturedAt: evidence.capturedAt,
      failures: failures.length,
      results: evidence.viewports,
    },
    null,
    2
  )
);
if (failures.length > 0) process.exitCode = 1;
