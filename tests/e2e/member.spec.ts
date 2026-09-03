import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`Aftercare is truthful and usable at ${viewport.name} width`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });

    const response = await page.goto('/aftercare', {
      waitUntil: 'networkidle',
    });
    expect(response?.ok()).toBe(true);
    await expect(
      page.getByRole('heading', {
        name: 'From confirmation to what comes next.',
      })
    ).toBeVisible();
    await expect(page.getByText('Shopify authoritative')).toBeVisible();

    for (const label of [
      'Confirmed',
      'In production',
      'Dispatched',
      'Delivered',
      'Return or refund',
    ]) {
      await expect(page.getByRole('heading', { name: label })).toBeVisible();
    }

    await expect(
      page.getByText('Self-service returns are not configured')
    ).toBeVisible();
    await expect(page.getByText('No CP Credit balance is shown')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Ask CP support' })
    ).toHaveAttribute('href', '/contact');
    await expect(
      page.getByRole('link', { name: 'Continue shopping' })
    ).toHaveAttribute('href', '/shop');

    await page.getByLabel('Preferred size').selectOption('M');
    await page.getByLabel('Preferred fit').selectOption('Relaxed');
    await page.getByRole('button', { name: 'Save fit preference' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Fit preference saved on this device.'
    );
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel('Preferred size')).toHaveValue('M');
    await expect(page.getByLabel('Preferred fit')).toHaveValue('Relaxed');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(viewport.width);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const unexpectedFailedRequests = failedRequests.filter(
      (entry) => !/^GET http:\/\/localhost:3000\/.*[?&]_rsc=/.test(entry)
    );
    expect(results.violations).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(unexpectedFailedRequests).toEqual([]);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(`aftercare-${viewport.name}.png`),
      fullPage: true,
    });
  });
}
