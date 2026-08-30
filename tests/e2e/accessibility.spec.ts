import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/product/carlophillips-signature-hoodie'];

for (const route of routes) {
  test(`WCAG A/AA and browser health: ${route}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main#main-content')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !message.includes('manifestIncompatibleCodecsError')
    );
    const unexpectedFailedRequests = failedRequests.filter(
      (entry) => !/^GET http:\/\/localhost:3000\/.*[?&]_rsc=/.test(entry)
    );
    expect(results.violations).toEqual([]);
    expect(unexpectedConsoleErrors).toEqual([]);
    expect(unexpectedFailedRequests).toEqual([]);

    await page.screenshot({
      path: testInfo.outputPath(
        `${route === '/' ? 'home' : 'pdp'}-accessibility.png`
      ),
      fullPage: true,
    });
  });
}
