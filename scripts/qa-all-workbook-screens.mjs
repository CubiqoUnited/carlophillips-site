import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'test_reports/workbook-visual-qa';
fs.mkdirSync(outDir, { recursive: true });

async function runQA() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
  
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    console.log(`\n=== Running QA for ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. Landing — Pre-Morph (01)
    await page.goto('https://carlophillips-site.vercel.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `01-landing-pre-morph-${vp.name}.png`) });
    console.log(`✓ 01-landing-pre-morph-${vp.name}.png`);

    // 2. Landing — Post-Morph & Discovery Stage (02 & 03)
    const enterBtn = page.getByRole('button', { name: /enter/i }).first();
    if (await enterBtn.isVisible().catch(() => false)) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(outDir, `02-landing-post-morph-${vp.name}.png`) });
    console.log(`✓ 02-landing-post-morph-${vp.name}.png`);

    // 3. Discovery — Default [Video Stage] (03)
    await page.evaluate(() => {
      const el = document.getElementById('signature-runway');
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `03-discovery-stage-${vp.name}.png`) });
    console.log(`✓ 03-discovery-stage-${vp.name}.png`);

    // 4. Discovery — Order CTA Active (04)
    const orderBtn = page.getByRole('button', { name: /order/i }).first();
    if (await orderBtn.isVisible().catch(() => false)) {
      await orderBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `04-discovery-order-active-${vp.name}.png`) });
      console.log(`✓ 04-discovery-order-active-${vp.name}.png`);

      // Close order panel if needed
      const closeOrder = page.getByRole('button', { name: /close order/i }).first();
      if (await closeOrder.isVisible().catch(() => false)) await closeOrder.click();
      await page.waitForTimeout(300);
    }

    // 5. Discovery — Overlay Gallery (05 & 06)
    const galleryBtn = page.getByRole('button', { name: /view gallery/i }).first();
    if (await galleryBtn.isVisible().catch(() => false)) {
      await galleryBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `05-gallery-overlay-${vp.name}.png`) });
      console.log(`✓ 05-gallery-overlay-${vp.name}.png`);
      const closeGallery = page.getByRole('button', { name: /close/i }).first();
      if (await closeGallery.isVisible().catch(() => false)) await closeGallery.click();
      await page.waitForTimeout(300);
    }

    // 6. All Categories Grid (07)
    const catBtn = page.getByRole('button', { name: /all categories/i }).first();
    if (await catBtn.isVisible().catch(() => false)) {
      await catBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `07-all-categories-grid-${vp.name}.png`) });
      console.log(`✓ 07-all-categories-grid-${vp.name}.png`);
      const closeCat = page.getByRole('button', { name: /close/i }).first();
      if (await closeCat.isVisible().catch(() => false)) await closeCat.click();
      await page.waitForTimeout(300);
    }

    // 7. Product Grid (All Hoodies) (08)
    const prodBtn = page.getByRole('button', { name: /all hoodies/i }).first();
    if (await prodBtn.isVisible().catch(() => false)) {
      await prodBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `08-product-grid-hoodies-${vp.name}.png`) });
      console.log(`✓ 08-product-grid-hoodies-${vp.name}.png`);
      const closeProd = page.getByRole('button', { name: /close/i }).first();
      if (await closeProd.isVisible().catch(() => false)) await closeProd.click();
      await page.waitForTimeout(300);
    }

    // 8. Navigation Menu (21)
    const menuBtn = page.getByRole('button', { name: /menu/i }).first();
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `21-menu-navigation-${vp.name}.png`) });
      console.log(`✓ 21-menu-navigation-${vp.name}.png`);
      const closeMenu = page.getByRole('button', { name: /close navigation/i }).first();
      if (await closeMenu.isVisible().catch(() => false)) await closeMenu.click();
      await page.waitForTimeout(300);
    }

    // 9. Size Guide (22)
    // Open order first then size guide
    if (await orderBtn.isVisible().catch(() => false)) {
      await orderBtn.click();
      await page.waitForTimeout(400);
      const sizeGuideBtn = page.getByRole('button', { name: /size guide/i }).first();
      if (await sizeGuideBtn.isVisible().catch(() => false)) {
        await sizeGuideBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(outDir, `22-size-guide-modal-${vp.name}.png`) });
        console.log(`✓ 22-size-guide-modal-${vp.name}.png`);
        const closeGuide = page.getByRole('button', { name: /close/i }).first();
        if (await closeGuide.isVisible().catch(() => false)) await closeGuide.click();
        await page.waitForTimeout(300);
      }
      const closeOrder = page.getByRole('button', { name: /close/i }).first();
      if (await closeOrder.isVisible().catch(() => false)) await closeOrder.click();
      await page.waitForTimeout(300);
    }

    // 10. Added to Bag & Cart Drawer (09 & 23)
    if (await orderBtn.isVisible().catch(() => false)) {
      await orderBtn.click();
      await page.waitForTimeout(400);
      const addBagBtn = page.getByRole('button', { name: /add to bag/i }).first();
      if (await addBagBtn.isVisible().catch(() => false)) {
        await addBagBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(outDir, `23-added-to-bag-toast-${vp.name}.png`) });
        console.log(`✓ 23-added-to-bag-toast-${vp.name}.png`);
        
        const viewBagBtn = page.getByRole('button', { name: /view bag/i }).first();
        if (await viewBagBtn.isVisible().catch(() => false)) {
          await viewBagBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(outDir, `09-cart-drawer-${vp.name}.png`) });
          console.log(`✓ 09-cart-drawer-${vp.name}.png`);
          const closeBag = page.getByRole('button', { name: /close bag/i }).first();
          if (await closeBag.isVisible().catch(() => false)) await closeBag.click();
          await page.waitForTimeout(300);
        }
      }
    }

    // 11. Checkout Route (10)
    await page.goto('https://carlophillips-site.vercel.app/checkout', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `10-checkout-default-${vp.name}.png`) });
    console.log(`✓ 10-checkout-default-${vp.name}.png`);

    // 12. Confirmation Route (11)
    await page.goto('https://carlophillips-site.vercel.app/checkout/confirmation?order=CP-20482', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `11-order-confirmation-${vp.name}.png`) });
    console.log(`✓ 11-order-confirmation-${vp.name}.png`);

    // 13. Contact Us / Support Route (13 & 26)
    await page.goto('https://carlophillips-site.vercel.app/contact', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `13-contact-support-${vp.name}.png`) });
    console.log(`✓ 13-contact-support-${vp.name}.png`);

    // 14. Private List Route (16, 17, 18, 28)
    await page.goto('https://carlophillips-site.vercel.app/private-list', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `16-private-list-${vp.name}.png`) });
    console.log(`✓ 16-private-list-${vp.name}.png`);

    // 15. Order Tracking Route (27)
    await page.goto('https://carlophillips-site.vercel.app/track?order=CP-0001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, `27-order-tracking-${vp.name}.png`) });
    console.log(`✓ 27-order-tracking-${vp.name}.png`);

    await context.close();
  }

  await browser.close();
  console.log('\n=== All QA screenshots captured successfully! ===\n');
}

runQA().catch(console.error);
