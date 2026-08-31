import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const allowedOrigins = new Set([
  'http://localhost:3000',
  'https://image.mux.com',
  'https://stream.mux.com',
  'https://cdn.shopify.com',
]);

function isAllowedOrigin(url: URL): boolean {
  return (
    allowedOrigins.has(url.origin) ||
    (url.protocol === 'https:' && url.hostname.endsWith('.edgemv.mux.com'))
  );
}

const routes = ['/', '/product/carlophillips-signature-hoodie', '/contact'];

test('customer PII stays on the support intake boundary', async ({
  page,
}, testInfo) => {
  const sentinelEmail = 'privacy-audit@example.invalid';
  const sentinelOrder = 'CP-PRIVACY-AUDIT';
  const sentinelMessage =
    'Privacy audit message that must not reach analytics.';
  const sensitiveValues = [sentinelEmail, sentinelOrder, sentinelMessage];
  const requests: Array<{ method: string; origin: string; path: string }> = [];
  const leaks: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['http:', 'https:'].includes(url.protocol)) return;
    requests.push({
      method: request.method(),
      origin: url.origin,
      path: url.pathname,
    });
    if (!isAllowedOrigin(url)) leaks.push(`unknown-origin:${url.origin}`);

    const material = `${request.url()}\n${request.postData() || ''}`;
    const carriesPii = sensitiveValues.some((value) =>
      material.includes(value)
    );
    const isSupportIntake =
      url.origin === 'http://localhost:3000' &&
      url.pathname === '/api/contact' &&
      request.method() === 'POST';
    if (carriesPii && !isSupportIntake)
      leaks.push(`pii-outside-support:${url.origin}${url.pathname}`);
  });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBe(true);
  }

  await page.getByLabel('Email').fill(sentinelEmail);
  await page.getByLabel('How can we help?').selectOption('order-status');
  await page.getByLabel('Order number (optional)').fill(sentinelOrder);
  await page.getByLabel('Message').fill(sentinelMessage);
  const intake = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/contact') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Send request' }).click();
  expect((await intake).status()).toBe(503);
  await expect(page.getByText('Your request was not sent.')).toBeVisible();

  const browserState = await page.evaluate(() => ({
    local: Object.values(localStorage),
    session: Object.values(sessionStorage),
    cookie: document.cookie,
  }));
  expect(JSON.stringify(browserState)).not.toContain(sentinelEmail);
  expect(JSON.stringify(browserState)).not.toContain(sentinelOrder);
  expect(JSON.stringify(browserState)).not.toContain(sentinelMessage);
  expect([...new Set(leaks)]).toEqual([]);

  const sanitized = [
    ...new Map(
      requests.map((request) => [
        `${request.method} ${request.origin}${request.path}`,
        request,
      ])
    ).values(),
  ].sort((left, right) =>
    `${left.origin}${left.path}`.localeCompare(`${right.origin}${right.path}`)
  );
  await writeFile(
    testInfo.outputPath('network-origins.json'),
    `${JSON.stringify(sanitized, null, 2)}\n`
  );
});
