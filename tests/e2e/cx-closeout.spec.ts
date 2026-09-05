import { expect, test } from '@playwright/test';

const widths = [320, 360, 390, 430, 768, 1024, 1440];
const routes = [
  '/',
  '/shop',
  '/collections',
  '/product/carlophillips-signature-hoodie',
  '/bag',
  '/member',
  '/contact',
];

test('all public routes remain within every acceptance viewport', async ({
  page,
}) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow, `${route} overflows at ${width}px`).toBeLessThanOrEqual(
        0
      );
    }
  }
});

test('narrow header keeps menu, brand and bag count visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/shop');
  await expect(page.getByRole('button', { name: /menu/i })).toContainText(
    /menu/i
  );
  await expect(page.getByRole('link', { name: 'CARLOPHILLIPS' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bag (0)' })).toBeVisible();
});

test('homepage gallery locks scroll, traps focus, closes and restores focus', async ({
  page,
}) => {
  await page.goto('/?screen=gallery', { waitUntil: 'networkidle' });
  const dialog = page.getByRole('dialog', { name: 'Gallery' });
  await expect(dialog).toBeVisible();
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
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe('');
});

test('customer copy and minimum target sizes are corrected', async ({
  page,
}) => {
  await page.goto('/member');
  await expect(
    page.getByRole('heading', { name: 'Your account.' })
  ).toBeVisible();
  await expect(page.locator('.cp-account-signed-out')).not.toContainText(
    /aftercare|private staging/i
  );

  await page.goto('/');
  const undersized = await page
    .locator(
      '.cp-workbook-nav:visible, .cp-workbook-video-controls > button:visible, .cp-workbook-video-selector button:visible, .cp-workbook-discovery-tray button:visible, .cp-commerce-menu-trigger:visible, .cp-commerce-mobile-bag:visible'
    )
    .evaluateAll((items) =>
      items
        .map((item) => ({
          text: item.getAttribute('aria-label') || item.textContent?.trim(),
          rect: item.getBoundingClientRect(),
        }))
        .filter(
          ({ rect }) =>
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.width < 44 || rect.height < 44)
        )
        .map(({ text, rect }) => ({
          text,
          width: rect.width,
          height: rect.height,
        }))
    );
  expect(undersized).toEqual([]);
});
