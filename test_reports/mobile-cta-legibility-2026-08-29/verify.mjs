import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const outputDirectory = new URL('./', import.meta.url);
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of [
  { name: 'stacked', width: 980, height: 1200 },
  { name: 'desktop', width: 1440, height: 1000 },
]) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('http://127.0.0.1:3217/#signature-runway', { waitUntil: 'domcontentloaded' });
  const actions = page.locator('.cp-discovery-actions');
  await actions.waitFor({ state: 'visible' });
  await actions.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  const measurements = await actions.evaluate(element => {
    const style = getComputedStyle(element);
    const buttons = [...element.querySelectorAll('.cp-stack-action')];
    return {
      gap: style.gap,
      labels: buttons.map(button => ({
        text: button.textContent.trim().replace(/\s+/g, ' '),
        fontSize: getComputedStyle(button).fontSize,
        minHeight: getComputedStyle(button).minHeight,
      })),
    };
  });

  await actions.screenshot({ path: new URL(`${viewport.name}-cta-group.png`, outputDirectory).pathname });
  results.push({ viewport, ...measurements, consoleErrors });
  await page.close();
}

await browser.close();
await writeFile(
  new URL('results.json', outputDirectory),
  `${JSON.stringify(results, null, 2)}\n`,
  'utf8'
);

console.log(JSON.stringify(results, null, 2));
