import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = new URL('.', import.meta.url).pathname;
const productUrl =
  'http://localhost:3210/product/carlophillips-signature-hoodie';
const viewports = [
  { name: 'desktop-active-checkout', width: 1440, height: 1000 },
  { name: 'mobile-active-checkout', width: 390, height: 844 },
];

const browser = await chromium
  .launch({ channel: 'chrome', headless: true })
  .catch(() => chromium.launch({ headless: true }));
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(request.url());
  });

  const response = await page.goto(productUrl, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });
  await page.screenshot({
    path: path.join(outputDirectory, `${viewport.name}.png`),
    fullPage: true,
  });

  const result = await page.evaluate(() => {
    const text = document.body.innerText;
    const buttons = [...document.querySelectorAll('button')].map((button) => ({
      text: button.innerText.trim(),
      disabled: button.disabled,
    }));
    const forms = [...document.querySelectorAll('form')].map((form) => ({
      action: form.getAttribute('action'),
      method: form.getAttribute('method'),
    }));
    const unsupportedSizes = ['XS', 'XL', 'XXL', 'XXXL', '4XL', '5XL'].filter(
      (size) => new RegExp(`(^|\\s|/)${size}($|\\s|/)`, 'm').test(text)
    );

    return {
      title: document.title,
      hasUnavailable: text.includes('currently unavailable'),
      hasPrice: text.includes('$128'),
      hasSmall: /(^|\s)S($|\s)/m.test(text),
      hasMedium: /(^|\s)M($|\s)/m.test(text),
      hasLarge: /(^|\s)L($|\s)/m.test(text),
      unsupportedSizes,
      buttons,
      forms,
      imageCount: document.querySelectorAll('img').length,
      videoCount: document.querySelectorAll('video').length,
      horizontalOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    };
  });

  results.push({
    viewport: viewport.name,
    status: response?.status() ?? null,
    ...result,
    consoleErrors,
    failedRequests,
  });
  await page.close();
}

await browser.close();
await writeFile(
  path.join(outputDirectory, 'active-checkout-results.json'),
  `${JSON.stringify(results, null, 2)}\n`
);
console.log(JSON.stringify(results, null, 2));
