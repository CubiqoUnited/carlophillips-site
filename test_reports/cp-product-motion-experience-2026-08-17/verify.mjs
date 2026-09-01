import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('test_reports/cp-product-motion-experience-2026-08-17');
await mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const spec of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const context = await browser.newContext({
    viewport: { width: spec.width, height: spec.height },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => requestFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));

  await page.goto('http://127.0.0.1:3132/qa-product-experience', { waitUntil: 'networkidle' });
  await page.locator('#signature-runway').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const runway = page.locator('#signature-runway');
  await runway.screenshot({ path: path.join(output, 'screenshots', `${spec.name}-runway.png`) });

  const mainAssertions = {
    price: await runway.getByText('Order — $128').count(),
    gallery: await runway.getByText('View gallery').count(),
    galleryCount: await runway.getByText('12', { exact: true }).count(),
    motionControl: await runway.getByRole('button', { name: /motion/i }).count(),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  };

  await runway.getByText('View gallery').click();
  const gallery = page.locator('#product-media-overlay');
  await gallery.waitFor({ state: 'visible' });
  await gallery.screenshot({ path: path.join(output, 'screenshots', `${spec.name}-gallery.png`) });
  const counterBefore = (await gallery.locator('[aria-live="polite"]').last().textContent())?.trim();
  await gallery.getByRole('button', { name: 'Play auto' }).click();
  await page.mouse.move(2, 2);
  const suspended = await gallery.locator('.cp-media-auto-progress').getAttribute('data-auto-suspended');
  await page.waitForTimeout(6200);
  const counterAfter = (await gallery.locator('[aria-live="polite"]').last().textContent())?.trim();

  await gallery.getByRole('button', { name: /Order/ }).click();
  const order = page.locator('.cp-order-tray');
  await order.waitFor({ state: 'visible' });
  await order.screenshot({ path: path.join(output, 'screenshots', `${spec.name}-order.png`) });
  const orderAssertions = {
    sizes: await order.getByRole('radio').allTextContents(),
    selected: await order.getByRole('radio', { checked: true }).textContent(),
    addToBag: await order.getByRole('button', { name: 'Add to bag' }).isEnabled(),
    buyNow: await order.getByRole('button', { name: /Buy now/ }).isEnabled(),
  };

  await order.getByRole('button', { name: /Size & Fit/ }).click();
  const fit = page.locator('.cp-size-fit-drawer');
  await fit.waitFor({ state: 'visible' });
  await fit.screenshot({ path: path.join(output, 'screenshots', `${spec.name}-size-fit.png`) });
  await fit.getByRole('button', { name: 'Close size and fit guide' }).click();
  await order.getByRole('button', { name: 'Add to bag' }).click();
  const bag = page.locator('.cp-bag-drawer');
  await bag.waitFor({ state: 'visible' });
  await bag.screenshot({ path: path.join(output, 'screenshots', `${spec.name}-bag.png`) });
  const bagAssertions = {
    title: await bag.getByText('Your bag').count(),
    checkout: await bag.getByRole('button', { name: /Checkout/ }).isEnabled(),
    subtotal: await bag.getByText('$128').count(),
  };

  results.push({
    viewport: spec,
    mainAssertions,
    galleryAutoplay: { counterBefore, counterAfter, suspended, advanced: counterBefore !== counterAfter },
    orderAssertions,
    bagAssertions,
    consoleErrors,
    requestFailures,
  });
  await context.close();
}

await browser.close();
await writeFile(path.join(output, 'verification.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);

const failures = results.flatMap(result => [
  result.mainAssertions.price === 1 ? null : `${result.viewport.name}: price CTA missing`,
  result.mainAssertions.gallery === 1 ? null : `${result.viewport.name}: gallery CTA missing`,
  result.mainAssertions.galleryCount === 1 ? null : `${result.viewport.name}: gallery count missing`,
  result.mainAssertions.motionControl === 1 ? null : `${result.viewport.name}: motion control missing`,
  result.mainAssertions.horizontalOverflow ? `${result.viewport.name}: horizontal overflow` : null,
  result.galleryAutoplay.advanced ? null : `${result.viewport.name}: gallery autoplay did not advance`,
  JSON.stringify(result.orderAssertions.sizes) === JSON.stringify(['S', 'M', 'L']) ? null : `${result.viewport.name}: offer is not exactly S/M/L`,
  result.orderAssertions.addToBag && result.orderAssertions.buyNow ? null : `${result.viewport.name}: order actions disabled`,
  result.bagAssertions.title === 1 && result.bagAssertions.checkout && result.bagAssertions.subtotal > 0 ? null : `${result.viewport.name}: bag confirmation incomplete`,
  result.consoleErrors.length ? `${result.viewport.name}: console errors ${result.consoleErrors.join(' | ')}` : null,
  result.requestFailures.length ? `${result.viewport.name}: request failures ${result.requestFailures.join(' | ')}` : null,
].filter(Boolean));

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Product-motion experience QA passed for ${results.length} viewports.`);
