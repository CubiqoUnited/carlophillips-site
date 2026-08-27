/**
 * Render each page of the workbook PDF to a PNG using Playwright's PDF viewer.
 * Only the first 28 numbered screens are needed for the gap audit.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PDF_PATH = '/Users/edv/.gemini/antigravity/brain/ba4454e8-1f64-4e5e-a90b-0e505fa23824/.user_uploaded/media_1787711413852.pdf';
const OUT_DIR  = 'test_reports/pdf-pages';
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES_TO_CAPTURE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const pg = await ctx.newPage();

  const pdfUrl = `file://${PDF_PATH}`;
  await pg.goto(pdfUrl, { waitUntil: 'load' });
  await pg.waitForTimeout(3000);

  // For each desired page, use PDF viewer navigation
  for (const pageNum of PAGES_TO_CAPTURE) {
    try {
      // Navigate to specific page via hash
      await pg.goto(`${pdfUrl}#page=${pageNum}`, { waitUntil: 'load' });
      await pg.waitForTimeout(1500);
      await pg.screenshot({ path: path.join(OUT_DIR, `page-${String(pageNum).padStart(2, '0')}.png`) });
      console.log(`✓ page ${pageNum}`);
    } catch (err) {
      console.error(`✗ page ${pageNum}:`, err.message);
    }
  }

  await browser.close();
  console.log('PDF extraction done.');
}

run().catch(console.error);
