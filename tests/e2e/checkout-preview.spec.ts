import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';
const APPROVED_REFERENCE =
  'sha256:0938f4582f512244658066942f269c16cca1efdec1e197868c05cfdb8fa5859d';
const EXPECTED_LOCAL_BLOCK = 'PRODUCT_RELEASE_NOT_RELEASED';

test.describe('Local fixture checkout boundary', () => {
  test('home remains truthful and cannot create a payment or order', async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });

    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('form[action="/api/checkout"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/checkout\.shopify/i);
    await page.screenshot({
      path: testInfo.outputPath('01-home-fail-closed.png'),
      fullPage: true,
    });

    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !message.includes('manifestIncompatibleCodecsError')
    );
    const unexpectedFailedRequests = failedRequests.filter(
      (entry) => !/^GET http:\/\/localhost:3000\/.*[?&]_rsc=/.test(entry)
    );
    expect(unexpectedConsoleErrors).toEqual([]);
    expect(unexpectedFailedRequests).toEqual([]);
  });

  test('PDP remains visibly fail-closed for the local fixture', async ({
    page,
  }, testInfo) => {
    const response = await page.goto(`/product/${HANDLE}`, {
      waitUntil: 'networkidle',
    });
    expect(response?.ok()).toBe(true);
    const form = page.locator('form[action="/api/checkout"]');
    await expect(form).toHaveCount(0);
    await expect(page.locator('main#main-content')).toContainText(
      /purchasing is disabled|unavailable/i
    );
    await page.screenshot({
      path: testInfo.outputPath('02-pdp-fail-closed.png'),
      fullPage: true,
    });
  });

  test('server checkout evaluation reaches the release-state boundary for an approved offer', async ({
    request,
  }) => {
    const response = await request.post('/api/checkout', {
      form: {
        handle: HANDLE,
        referenceHash: APPROVED_REFERENCE,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: EXPECTED_LOCAL_BLOCK,
    });
    expect(response.headers()['location']).toBeUndefined();
  });

  test('checkout rejects cross-origin requests before release evaluation', async ({
    request,
  }) => {
    const response = await request.post('/api/checkout', {
      headers: { Origin: 'https://attacker.invalid' },
      form: {
        handle: HANDLE,
        referenceHash: APPROVED_REFERENCE,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'ORIGIN_REJECTED',
    });
  });
});
