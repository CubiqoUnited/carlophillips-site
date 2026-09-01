import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';
const OPAQUE_REFERENCE = `sha256:${'0'.repeat(64)}`;
const EXPECTED_LOCAL_BLOCK = 'SHOPIFY_CART_NOT_CONFIGURED';

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
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollSnapType
      )
    ).toBe('y mandatory');
    await expect(page.locator('form[action="/api/cart"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/checkout\.shopify/i);
    await page.locator('#signature-runway').evaluate((element) =>
      element.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      })
    );
    const orderButton = page.locator('.cp-workbook-order-cta');
    await expect(orderButton).toBeVisible();
    const orderBox = await orderButton.boundingBox();
    const viewport = page.viewportSize();
    expect(orderBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(orderBox!.y).toBeGreaterThanOrEqual(0);
    expect(orderBox!.y + orderBox!.height).toBeLessThanOrEqual(
      viewport!.height
    );
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
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollSnapType
      )
    ).toBe('none');
    const form = page.locator('form[action="/api/cart"]');
    await expect(form).toHaveCount(0);
    await expect(page.locator('main#main-content')).toContainText(
      /purchasing is disabled|unavailable/i
    );
    await page.screenshot({
      path: testInfo.outputPath('02-pdp-fail-closed.png'),
      fullPage: true,
    });
  });

  test('server cart evaluation rejects the unconfigured local fixture environment', async ({
    request,
  }) => {
    const response = await request.post('/api/cart', {
      form: {
        cartAction: 'add',
        handle: HANDLE,
        referenceHash: OPAQUE_REFERENCE,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: EXPECTED_LOCAL_BLOCK,
    });
    expect(response.headers()['location']).toBeUndefined();
  });

  test('cart rejects cross-origin requests before Shopify evaluation', async ({
    request,
  }) => {
    const response = await request.post('/api/cart', {
      headers: { Origin: 'https://attacker.invalid' },
      form: {
        cartAction: 'add',
        handle: HANDLE,
        referenceHash: OPAQUE_REFERENCE,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'ORIGIN_REJECTED',
    });
  });
});
