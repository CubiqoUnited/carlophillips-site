import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'test_reports/full-audit';
fs.mkdirSync(outDir, { recursive: true });

const BASE = 'https://carlophillips-site.vercel.app';

async function shot(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
  console.log('✓', name);
}

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  
  // ── DESKTOP 1440 × 900 ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pg = await ctx.newPage();

    // 01 Pre-morph
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800);
    await shot(pg, 'D-01-pre-morph.png');

    // 02 Post-morph (after ENTER)
    await pg.getByRole('button', { name: /enter/i }).first().click();
    await pg.waitForTimeout(1200);
    await shot(pg, 'D-02-post-morph.png');

    // 03 Discovery stage (full)
    await pg.evaluate(() => document.getElementById('signature-runway')?.scrollIntoView());
    await pg.waitForTimeout(600);
    await shot(pg, 'D-03-discovery-stage.png');

    // 04 Order panel open
    const orderBtn = pg.getByRole('button', { name: /^order/i }).first();
    if (await orderBtn.isVisible().catch(() => false)) {
      await orderBtn.click();
      await pg.waitForTimeout(600);
      await shot(pg, 'D-04-order-panel.png');
    }

    // 05 Gallery overlay
    const closeOrder = pg.getByRole('button', { name: /close order/i }).first();
    if (await closeOrder.isVisible().catch(() => false)) await closeOrder.click();
    await pg.waitForTimeout(300);
    const gallBtn = pg.getByRole('button', { name: /view gallery/i }).first();
    if (await gallBtn.isVisible().catch(() => false)) {
      await gallBtn.click();
      await pg.waitForTimeout(600);
      await shot(pg, 'D-05-gallery.png');
      const closeGall = pg.getByRole('button', { name: /close/i }).first();
      if (await closeGall.isVisible().catch(() => false)) await closeGall.click();
      await pg.waitForTimeout(300);
    }

    // 07 Categories
    const catBtn = pg.getByRole('button', { name: /all categories/i }).first();
    if (await catBtn.isVisible().catch(() => false)) {
      await catBtn.click();
      await pg.waitForTimeout(600);
      await shot(pg, 'D-07-categories.png');
      const closeCat = pg.getByRole('button', { name: /close/i }).first();
      if (await closeCat.isVisible().catch(() => false)) await closeCat.click();
      await pg.waitForTimeout(300);
    }

    // 08 Hoodies grid
    const hoodiesBtn = pg.getByRole('button', { name: /all hoodies/i }).first();
    if (await hoodiesBtn.isVisible().catch(() => false)) {
      await hoodiesBtn.click();
      await pg.waitForTimeout(600);
      await shot(pg, 'D-08-hoodies.png');
      const closeH = pg.getByRole('button', { name: /close/i }).first();
      if (await closeH.isVisible().catch(() => false)) await closeH.click();
      await pg.waitForTimeout(300);
    }

    // 09 Cart with items
    const orderBtn2 = pg.getByRole('button', { name: /^order/i }).first();
    if (await orderBtn2.isVisible().catch(() => false)) {
      await orderBtn2.click();
      await pg.waitForTimeout(400);
      const addBag = pg.getByRole('button', { name: /add to bag/i }).first();
      if (await addBag.isVisible().catch(() => false)) {
        await addBag.click();
        await pg.waitForTimeout(600);
        await shot(pg, 'D-09-added-to-bag.png');
        const viewBag = pg.getByRole('button', { name: /view bag/i }).first();
        if (await viewBag.isVisible().catch(() => false)) {
          await viewBag.click();
          await pg.waitForTimeout(600);
          await shot(pg, 'D-09-cart-drawer.png');
        }
      }
    }

    // 21 Menu
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    const menuBtn = pg.getByRole('button', { name: /menu/i }).first();
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await pg.waitForTimeout(500);
      await shot(pg, 'D-21-menu.png');
      const closeMenu = pg.getByRole('button', { name: /close navigation/i }).first();
      if (await closeMenu.isVisible().catch(() => false)) await closeMenu.click();
    }

    // 10 Checkout
    await pg.goto(BASE + '/checkout', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    await shot(pg, 'D-10-checkout.png');

    // 11 Confirmation
    await pg.goto(BASE + '/checkout/confirmation?order=CP-20482', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    await shot(pg, 'D-11-confirmation.png');

    // 13 Contact
    await pg.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    await shot(pg, 'D-13-contact.png');

    // 16 Private list
    await pg.goto(BASE + '/private-list', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    await shot(pg, 'D-16-private-list.png');

    // 27 Tracking
    await pg.goto(BASE + '/track?order=CP-0001', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    await shot(pg, 'D-27-tracking.png');

    await ctx.close();
  }

  // ── MOBILE 390 × 844 ────────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pg = await ctx.newPage();

    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(800);
    await shot(pg, 'M-01-pre-morph.png');

    await pg.getByRole('button', { name: /enter/i }).first().click();
    await pg.waitForTimeout(1200);
    await shot(pg, 'M-02-post-morph.png');

    await pg.evaluate(() => document.getElementById('signature-runway')?.scrollIntoView());
    await pg.waitForTimeout(600);
    await shot(pg, 'M-03-discovery.png');

    const orderBtn = pg.getByRole('button', { name: /^order/i }).first();
    if (await orderBtn.isVisible().catch(() => false)) {
      await orderBtn.click();
      await pg.waitForTimeout(600);
      await shot(pg, 'M-04-order-panel.png');
    }

    await pg.goto(BASE + '/checkout', { waitUntil: 'networkidle' });
    await shot(pg, 'M-10-checkout.png');

    await pg.goto(BASE + '/checkout/confirmation?order=CP-20482', { waitUntil: 'networkidle' });
    await shot(pg, 'M-11-confirmation.png');

    await pg.goto(BASE + '/contact', { waitUntil: 'networkidle' });
    await shot(pg, 'M-13-contact.png');

    await pg.goto(BASE + '/private-list', { waitUntil: 'networkidle' });
    await shot(pg, 'M-16-private-list.png');

    await ctx.close();
  }

  await browser.close();
  console.log('\nAll audit screenshots done. Files:', fs.readdirSync(outDir).length);
}

run().catch(console.error);
