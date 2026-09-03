import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';
const expectedCheckoutHosts = new Set(
  (process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

test('Shopify-authoritative S/M/L, bag, checkout handoff, a11y and browser health', async ({
  context,
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const networkFailures: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    networkFailures.push(
      `${request.method()} ${new URL(request.url()).origin}`
    );
  });

  const productResponse = await page.goto(`/product/${HANDLE}`, {
    waitUntil: 'networkidle',
  });
  expect(productResponse?.ok()).toBe(true);
  await expect(page.locator('main#main-content')).toBeVisible();
  await expect(page.getByText('Shopify', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Select size' })).toBeVisible();
  const sizeButtons = page
    .getByRole('group', { name: 'Select size' })
    .getByRole('button');
  await expect(sizeButtons).toHaveText(['S', 'M', 'L']);
  await expect(page.locator('#product-variant option')).toHaveText([
    'S — $128',
    'M — $128',
    'L — $128',
  ]);
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await expect(page.locator('#product-variant')).toHaveValue(
    /^sha256:[a-f0-9]{64}$/
  );
  await page.screenshot({
    path: testInfo.outputPath('01-shopify-product-sml.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: 'ADD TO TEST BAG $128' }).click();
  await page.waitForURL('**/bag');
  await expect(page.locator('main#main-content')).toHaveAttribute(
    'data-commerce-source',
    'store'
  );
  await expect(page.getByText('Size: M')).toBeVisible();
  await expect(page.getByText('$128.00')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Continue to checkout' })
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath('02-shopify-bag-truth.png'),
    fullPage: true,
  });

  const cookies = await context.cookies();
  const checkoutResponse = await page.request.post('/api/cart', {
    form: { cartAction: 'checkout' },
    headers: {
      cookie: cookies.map(({ name, value }) => `${name}=${value}`).join('; '),
      origin: new URL(process.env.CP_RELEASE_GATE_BASE_URL!).origin,
    },
    maxRedirects: 0,
  });
  expect(checkoutResponse.status()).toBe(303);
  const location = checkoutResponse.headers().location;
  expect(location).toBeTruthy();
  const checkout = new URL(location!);
  expect(checkout.protocol).toBe('https:');
  expect(expectedCheckoutHosts.has(checkout.hostname)).toBe(true);
  await checkoutResponse.dispose();

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(networkFailures).toEqual([]);

  const productImage = testInfo.outputPath('01-shopify-product-sml.png');
  const bagImage = testInfo.outputPath('02-shopify-bag-truth.png');
  const screenshotHash = createHash('sha256')
    .update(await readFile(productImage))
    .update(await readFile(bagImage))
    .digest('hex');
  await writeFile(
    testInfo.outputPath('browser-proof.json'),
    `${JSON.stringify(
      {
        schemaVersion: 'cp.protected-staging-browser-proof.v1',
        viewportWidth: page.viewportSize()?.width,
        shopifyAuthoritativeProduct: true,
        sizeSelection: true,
        bagTruth: true,
        hostedStagingCheckout: true,
        accessibilityPassed: true,
        consoleErrors: 0,
        networkFailures: 0,
        screenshotHash: `sha256:${screenshotHash}`,
        privateCheckoutUrlRetained: false,
        paymentAttempted: false,
        orderSubmitted: false,
      },
      null,
      2
    )}\n`
  );
});
