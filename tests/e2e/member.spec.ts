import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('CP Member private review surface works at desktop and mobile widths', async ({
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

  const response = await page.goto('/member', { waitUntil: 'networkidle' });
  expect(response?.ok()).toBe(true);
  await expect(
    page.getByRole('heading', { name: 'A private layer around the brand.' })
  ).toBeVisible();
  await expect(page.getByText('Private review fixture')).toBeVisible();
  await expect(
    page.getByText('does not create a live Shopify customer account')
  ).toBeVisible();

  await page.getByLabel('Email address').fill('preview@example.com');
  await page.getByLabel(/I want CP private-list updates/).check();
  await page.getByRole('button', { name: 'Join the private list' }).click();
  await expect(page.getByRole('status')).toContainText(
    'You are on the private list.'
  );

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
    path: testInfo.outputPath('member-private-review.png'),
    fullPage: true,
  });
});
