import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';
const EXPECTED_BLOCK = 'PRODUCT_RELEASE_NOT_RELEASED';

test.describe('Preview Draft checkout gate', () => {
  test('home review journey cannot create a payment or order', async ({
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

    await page.goto('/');
    await expect(page.locator('main#main-content')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('01-home.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: /order/i }).click();
    const orderTray = page.getByRole('dialog');
    await expect(orderTray).toBeVisible();
    await orderTray.getByRole('radio', { name: 'Size M' }).click();
    await expect(
      orderTray.getByRole('radio', { name: 'Size M' })
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('body')).not.toContainText(/checkout\.shopify/i);
    await page.screenshot({
      path: testInfo.outputPath('02-size-selected.png'),
      fullPage: true,
    });

    await orderTray.getByRole('button', { name: 'Add to bag' }).click();
    const bag = page.getByRole('dialog', { name: 'Your bag' });
    await expect(bag).toBeVisible();
    await expect(bag).toContainText('Black · M');

    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/checkout') &&
        response.request().method() === 'POST'
    );
    await bag.getByRole('button', { name: /checkout/i }).click();
    const response = await checkoutResponse;
    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: EXPECTED_BLOCK });
    expect(response.headers()['location']).toBeUndefined();
    await expect(page).toHaveURL(/\/$/);
    await expect(bag.getByRole('status')).toContainText(
      'Draft review boundary confirmed. Checkout remains unavailable.'
    );
    await expect(page.locator('body')).not.toContainText(/checkout\.shopify/i);
    await page.screenshot({
      path: testInfo.outputPath('03-checkout-truthful-block.png'),
      fullPage: true,
    });

    expect(failedRequests).toEqual([]);
    const expectedBoundaryErrors = consoleErrors.filter((message) =>
      message.includes('409 (Conflict)')
    );
    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !message.includes('409 (Conflict)')
    );
    expect(expectedBoundaryErrors).toHaveLength(1);
    expect(unexpectedConsoleErrors).toEqual([]);
  });

  test('PDP remains visibly fail-closed for the Draft fixture', async ({
    page,
  }) => {
    await page.goto(`/product/${HANDLE}`);
    const form = page.locator('form[action="/api/checkout"]');
    await expect(form).toHaveCount(0);
    await expect(page.locator('main#main-content')).toContainText(
      /purchasing is disabled|unavailable/i
    );
  });

  test('server checkout evaluation returns the Draft release result', async ({
    request,
  }) => {
    const response = await request.post('/api/checkout', {
      form: {
        handle: HANDLE,
        referenceHash: `sha256:${'a'.repeat(64)}`,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: EXPECTED_BLOCK });
  });

  test('checkout rejects cross-origin requests before release evaluation', async ({
    request,
  }) => {
    const response = await request.post('/api/checkout', {
      headers: { Origin: 'https://attacker.invalid' },
      form: {
        handle: HANDLE,
        referenceHash: `sha256:${'a'.repeat(64)}`,
        quantity: '1',
      },
    });
    expect(response.status()).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'ORIGIN_REJECTED',
    });
  });
});
