import { expect, test } from '@playwright/test';

test('support failures preserve the request and expose only the configured public fallback', async ({
  page,
}, testInfo) => {
  let attempts = 0;
  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource:')
    ) {
      browserErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.route('**/api/contact', async (route) => {
    attempts += 1;
    const status = attempts === 1 ? 502 : 503;
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        error:
          status === 502
            ? 'SUPPORT_DELIVERY_FAILED'
            : 'SUPPORT_DESTINATION_NOT_CONFIGURED',
      }),
    });
  });

  await page.goto('/contact');
  await page.getByLabel('Email').fill('customer@example.invalid');
  await page.getByLabel('How can we help?').selectOption('order-status');
  await page.getByLabel('Order number (optional)').fill('CP-TEST-1001');
  await page
    .getByLabel('Message')
    .fill('Please help me find the current status of my order.');

  const submit = page.getByRole('button', { name: 'Send request' });
  await submit.click();
  await expect(page.getByText('Your request was not sent.')).toBeVisible();
  await expect(page.getByText(/secure order-status link/)).toBeVisible();
  const fallback = page.getByRole('link', {
    name: 'open the public support channel',
  });
  await expect(fallback).toHaveAttribute(
    'href',
    'https://support.carlophillips.example/contact'
  );
  await expect(submit).toBeEnabled();
  await expect(page.getByLabel('Email')).toHaveValue(
    'customer@example.invalid'
  );
  await expect(page.getByLabel('Order number (optional)')).toHaveValue(
    'CP-TEST-1001'
  );
  await expect(page.getByLabel('Message')).toHaveValue(
    'Please help me find the current status of my order.'
  );

  await submit.click();
  await expect(
    page.getByText('Email support is unavailable right now.')
  ).toBeVisible();
  await expect(page.getByText(/secure order-status link/)).toBeVisible();
  await expect(fallback).toBeVisible();
  await expect(submit).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath('support-fallback.png'),
    fullPage: true,
  });
  expect(browserErrors).toEqual([]);
});
