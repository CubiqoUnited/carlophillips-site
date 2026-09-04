import { expect, test } from '@playwright/test';

const HANDLE = 'carlophillips-signature-hoodie';

test.describe('corrected storefront visual evidence', () => {
  test('custom homepage hero and runway remain visually intact', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('.cp-workbook-order-cta')).toHaveText(
      /view product/i
    );
    await expect(page.locator('main#main-content')).toHaveScreenshot(
      'home-storefront.png',
      {
        animations: 'disabled',
      }
    );
  });

  test('PDP presentation remains intact', async ({ page }) => {
    await page.goto(`/product/${HANDLE}`, { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('main#main-content')).not.toContainText(
      'Sizes observed'
    );
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
    await expect(page.locator('main#main-content')).not.toContainText(
      'Commerce truth'
    );
    await expect(page.locator('main#main-content')).toHaveScreenshot(
      'bag.png',
      { animations: 'disabled' }
    );
  });
});
