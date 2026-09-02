import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';

test.describe('approved storefront visual baseline', () => {
  test('custom homepage hero and runway remain visually intact', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('main#main-content')).toHaveScreenshot(
      'home-storefront.png',
      { animations: 'disabled' }
    );
  });

  test('PDP presentation remains intact', async ({ page }) => {
    await page.goto(`/product/${HANDLE}`, { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('main#main-content')).toHaveScreenshot(
      'product-detail.png',
      { animations: 'disabled' }
    );
  });

  test('bag presentation and checkout CTA area remain intact', async ({
    page,
  }) => {
    await page.goto('/bag', { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('main#main-content')).toHaveScreenshot(
      'bag.png',
      { animations: 'disabled' }
    );
  });
});
