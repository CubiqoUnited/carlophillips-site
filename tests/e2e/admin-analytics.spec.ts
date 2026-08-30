import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.use({
  extraHTTPHeaders: { Authorization: 'Bearer qa-review-token' },
});

test('Admin analytics is truthful, accessible, and visually captured', async ({
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

  const response = await page.goto('/admin/analytics', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole('heading', { name: 'No verified analytics are connected' })
  ).toBeVisible();
  await expect(page.getByText('Not connected')).toBeVisible();
  await expect(page.getByText('Unavailable', { exact: true })).toBeVisible();
  await expect(page.locator('main')).not.toContainText(/revenue|conversion/i);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const unexpectedFailedRequests = failedRequests.filter(
    (entry) => !/^GET http:\/\/localhost:3000\/.*[?&]_rsc=/.test(entry)
  );
  expect(results.violations).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(unexpectedFailedRequests).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath('admin-analytics.png'),
    fullPage: true,
  });
});
