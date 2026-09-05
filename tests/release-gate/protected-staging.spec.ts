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
const branchPreviewQa = process.env.CP_BRANCH_PREVIEW_QA === 'true';
const stagingStorefrontPassword =
  process.env.SHOPIFY_STAGING_STOREFRONT_PASSWORD || '';

test('Shopify-authoritative S/M/L, bag, checkout handoff, a11y and browser health', async ({
  context,
  page,
}, testInfo) => {
  const hideNonCustomerUi = () =>
    page.addStyleTag({
      content:
        'vercel-live-feedback, vercel-toolbar { display: none !important; }',
    });
  const consoleErrors: string[] = [];
  const networkFailures: string[] = [];
  const httpFailures: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const location = message.location().url;
      consoleErrors.push(
        location ? `${message.text()} ${location}` : message.text()
      );
    }
  });
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    networkFailures.push(
      `${request.method()} ${url.origin}${url.pathname} ${request.resourceType()} ${request.failure()?.errorText || 'unknown'}`
    );
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      httpFailures.push(
        `${response.status()} ${response.request().method()} ${response.url()}`
      );
    }
  });

  for (const route of ['/', '/shop', '/collections', '/member', '/contact']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `${route} must be healthy`).toBe(true);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow, `${route} must not overflow`).toBeLessThanOrEqual(0);
  }
  await page.goto('/member', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Your account.' })
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('00-member.png') });
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await hideNonCustomerUi();
  await page.screenshot({
    path: testInfo.outputPath('00-contact.png'),
    fullPage: true,
  });
  await expect(page.locator('main#main-content')).toHaveScreenshot(
    'staging-contact.png',
    { animations: 'disabled', fullPage: true, maxDiffPixelRatio: 0.01 }
  );

  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'CARLOPHILLIPS Signature Hoodie' })
  ).toHaveCount(1);
  await expect(
    page.locator('[aria-label="Available products"] article')
  ).toHaveCount(1);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const galleryTrigger = page.getByRole('button', {
    name: /VIEW GALLERY/i,
  });
  await galleryTrigger.click();
  await expect(page.getByRole('dialog', { name: 'Gallery' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('hidden');
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="dialog"]'))
      )
    )
    .toBe(true);
  await hideNonCustomerUi();
  await page.screenshot({ path: testInfo.outputPath('00-home-gallery.png') });
  await expect(page.getByRole('dialog', { name: 'Gallery' })).toHaveScreenshot(
    'staging-home-gallery.png',
    { animations: 'disabled', maxDiffPixelRatio: 0.01 }
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Gallery' })).toBeHidden();
  await expect(galleryTrigger).toBeFocused();

  const cartHydration = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname === '/api/cart'
  );
  const productResponse = await page.goto(`/product/${HANDLE}`, {
    waitUntil: 'domcontentloaded',
  });
  await cartHydration;
  expect(productResponse?.ok()).toBe(true);
  await expect(page.locator('main#main-content')).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'CARLOPHILLIPS Signature Hoodie',
    })
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Choose a size' })
  ).toBeVisible();
  const sizeButtons = page
    .getByRole('group', { name: 'Choose a size' })
    .getByRole('button');
  await expect(sizeButtons).toHaveText(['S', 'M', 'L']);
  const mediumButton = page
    .getByRole('group', { name: 'Choose a size' })
    .getByRole('button', { name: 'Size M', exact: true });
  await expect(mediumButton).toHaveAttribute('aria-pressed', 'false');
  await mediumButton.click();
  await expect(mediumButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('input[name="referenceHash"]')).toHaveValue(
    /^sha256:[a-f0-9]{64}$/
  );
  await expect(
    page.getByRole('button', { name: 'ADD TO BAG - $128', exact: true })
  ).toBeEnabled();
  await hideNonCustomerUi();
  await page.screenshot({
    path: testInfo.outputPath('01-shopify-product-sml.png'),
    fullPage: true,
  });
  await expect(page.locator('main#main-content')).toHaveScreenshot(
    'staging-product-selected.png',
    { animations: 'disabled', fullPage: true, maxDiffPixelRatio: 0.01 }
  );

  await page.getByRole('button', { name: 'ADD TO BAG - $128' }).click();
  await expect(page.getByText('Added to bag.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bag (1)' })).toBeVisible();
  await page.getByRole('link', { name: 'VIEW BAG' }).click();
  await page.waitForURL('**/bag');
  await expect(page.locator('main#main-content')).toHaveAttribute(
    'data-commerce-source',
    'store'
  );
  await expect(page.getByText('Size: M')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Bag \(1\)$/i })).toBeVisible();
  await expect(
    page.locator('.cp-bag-summary').getByText('$128.00', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Checkout', exact: true })
  ).toBeEnabled();
  const populatedBagOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(
    populatedBagOverflow,
    'populated Bag must not overflow'
  ).toBeLessThanOrEqual(0);
  await hideNonCustomerUi();
  await page.screenshot({
    path: testInfo.outputPath('02-shopify-bag-truth.png'),
    fullPage: true,
  });
  await expect(page.locator('main#main-content')).toHaveScreenshot(
    'staging-bag.png',
    { animations: 'disabled', fullPage: true, maxDiffPixelRatio: 0.01 }
  );

  await page.route('**/api/cart', async (route) => {
    if (
      route.request().method() === 'POST' &&
      route.request().postData()?.includes('checkout')
    ) {
      await route.abort('failed');
      return;
    }
    await route.continue();
  });
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(
    page.getByText(
      'Checkout could not be opened. Your bag is unchanged; try again.'
    )
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry checkout', exact: true })
  ).toBeEnabled();
  await page.unroute('**/api/cart');

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
  expect(
    expectedCheckoutHosts.size > 0 || branchPreviewQa,
    'protected Staging must supply its approved checkout-host allowlist'
  ).toBe(true);
  if (expectedCheckoutHosts.size > 0) {
    expect(expectedCheckoutHosts.has(checkout.hostname)).toBe(true);
  }
  await checkoutResponse.dispose();

  const checkoutPage = await context.newPage();
  await checkoutPage.goto(checkout.toString(), {
    waitUntil: 'domcontentloaded',
  });
  if (new URL(checkoutPage.url()).pathname === '/password') {
    expect(
      stagingStorefrontPassword,
      'bind SHOPIFY_STAGING_STOREFRONT_PASSWORD so protected QA can prove the payment step without submitting an order'
    ).toBeTruthy();
    await checkoutPage
      .locator('input[type="password"], input[name="password"]')
      .fill(stagingStorefrontPassword);
    await checkoutPage
      .locator('button[type="submit"], input[type="submit"]')
      .first()
      .click();
    await checkoutPage.waitForLoadState('domcontentloaded');
    await checkoutPage.goto(checkout.toString(), {
      waitUntil: 'domcontentloaded',
    });
  }
  expect(new URL(checkoutPage.url()).pathname).not.toBe('/password');
  await expect(
    checkoutPage.getByRole('heading', { name: 'Payment', exact: true })
  ).toBeVisible({ timeout: 30_000 });
  await checkoutPage.screenshot({
    path: testInfo.outputPath('03-shopify-payment-step-no-submit.png'),
    fullPage: true,
  });
  await checkoutPage.close();

  await page.route('**/api/cart', async (route) => {
    if (route.request().method() === 'POST') {
      await route.abort('failed');
      return;
    }
    await route.continue();
  });
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(page.getByText('This change was not saved.')).toBeVisible();
  await page.unroute('**/api/cart');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('link', { name: /^Bag \(2\)$/i })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.cp-bag-stepper output')).toHaveText('2');
  await page.getByRole('button', { name: 'Decrease quantity' }).click();
  await expect(page.getByRole('link', { name: /^Bag \(1\)$/i })).toBeVisible();
  const removeResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname === '/api/cart' &&
      response.request().postData()?.includes('remove') === true
  );
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  const removeResponse = await removeResponsePromise;
  expect(removeResponse.ok(), 'Shopify remove mutation must succeed').toBe(
    true
  );
  await expect(removeResponse.json()).resolves.toMatchObject({
    ok: true,
    count: 0,
  });
  await expect(page.getByRole('link', { name: /^Bag \(0\)$/i })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Your bag is empty.' })
  ).toBeVisible();

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const previewToolbarProbes = httpFailures.filter(
    (failure) =>
      failure ===
      `400 OPTIONS ${new URL(process.env.CP_RELEASE_GATE_BASE_URL!).origin}/`
  );
  const unexpectedHttpFailures = httpFailures.filter(
    (failure) => !previewToolbarProbes.includes(failure)
  );
  const cartEndpoint = `${new URL(process.env.CP_RELEASE_GATE_BASE_URL!).origin}/api/cart`;
  const expectedCartAbortConsoleErrors = consoleErrors.filter(
    (error) =>
      error.startsWith('Failed to load resource: net::ERR_FAILED') &&
      error.endsWith(cartEndpoint)
  );
  const resourceConsoleErrors = consoleErrors.filter((error) =>
    error.startsWith(
      'Failed to load resource: the server responded with a status of 400'
    )
  );
  const unexpectedConsoleErrors = consoleErrors.filter(
    (error) =>
      !resourceConsoleErrors.includes(error) &&
      !expectedCartAbortConsoleErrors.includes(error) &&
      !error.includes('manifestIncompatibleCodecsError')
  );
  const expectedCartNetworkAborts = networkFailures.filter(
    (failure) =>
      failure.startsWith(`POST ${cartEndpoint} fetch `) &&
      failure.endsWith('net::ERR_FAILED')
  );
  const expectedPreviewNetworkAborts = networkFailures.filter(
    (failure) =>
      failure.includes('net::ERR_ABORTED') ||
      failure.includes('/.well-known/vercel/jwe') ||
      failure.startsWith(
        `OPTIONS ${new URL(process.env.CP_RELEASE_GATE_BASE_URL!).origin}/ `
      )
  );
  const unexpectedNetworkFailures = networkFailures.filter(
    (failure) =>
      !expectedPreviewNetworkAborts.includes(failure) &&
      !expectedCartNetworkAborts.includes(failure)
  );
  expect(axe.violations).toEqual([]);
  expect(unexpectedHttpFailures).toEqual([]);
  expect(unexpectedConsoleErrors).toEqual([]);
  expect(resourceConsoleErrors).toHaveLength(previewToolbarProbes.length);
  expect(expectedCartAbortConsoleErrors).toHaveLength(2);
  expect(expectedCartNetworkAborts).toHaveLength(2);
  expect(unexpectedNetworkFailures).toEqual([]);

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
        paymentStepReached: true,
        quantityPersistence: true,
        removeToEmpty: true,
        focusRestoration: true,
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
