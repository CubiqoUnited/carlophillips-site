import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toHomeCatalogSummary } from '../apps/web/src/lib/commerce/home-catalog-summary';

const decision = {
  schemaVersion: 'cp.catalog-decision.v1',
  environment: 'preview',
  status: 'available',
  source: 'shopify',
  candidateCount: 1,
  visibleCount: 1,
  excludedCount: 0,
  commerceAllowed: false,
  reason: 'CATALOG_ITEMS_AVAILABLE',
  excludedReasons: [],
  products: [
    {
      id: 'product-1',
      handle: 'future-release-piece',
      title: 'Future Release Piece',
      price: 245,
      currency: 'USD',
      description: 'Current reviewed product copy.',
      tagline: 'Edition',
      productType: 'outerwear',
      sourceLabel: 'Reviewed commerce source',
      commerceAllowed: false,
      colors: ['Black'],
      sizes: ['S', 'M', 'L'],
      details: [],
      variantPresentation: null,
      media: [],
    },
  ],
};

describe('monorepo home commerce projection', () => {
  it('keeps the Signature Hoodie as the canonical home hero regardless of Shopify order', () => {
    const summary = toHomeCatalogSummary({
      ...decision,
      candidateCount: 2,
      visibleCount: 2,
      products: [
        {
          ...decision.products[0],
          handle: 'carlophillips-rapid-logo-tee',
          title: 'CARLOPHILLIPS Rapid Logo Tee',
          productType: 'T-Shirts',
          price: 13.34,
        },
        {
          ...decision.products[0],
          handle: 'carlophillips-signature-hoodie',
          title: 'CARLOPHILLIPS Signature Hoodie',
          productType: 'Hoodies',
          price: 128,
        },
      ],
    });

    expect(summary.primaryProduct).toMatchObject({
      handle: 'carlophillips-signature-hoodie',
      title: 'CARLOPHILLIPS Signature Hoodie',
      price: 128,
    });
  });

  it('carries current product identity, copy, money, and choices into the home projection', () => {
    const summary = toHomeCatalogSummary(decision);

    expect(summary.primaryProduct).toMatchObject({
      handle: 'future-release-piece',
      href: '/product/future-release-piece',
      title: 'Future Release Piece',
      description: 'Current reviewed product copy.',
      price: 245,
      currency: 'USD',
      sizes: ['S', 'M', 'L'],
    });
  });

  it('removes the workbook payment simulation and hardcoded product price', () => {
    const source = readFileSync(
      'apps/web/src/components/editorial/WorkbookReplica.tsx',
      'utf8'
    );

    expect(source).toContain('formatCatalogPrice');
    expect(source).toContain('{productCtaLabel}');
    expect(source).toContain('{productDescription}');
    expect(source).toContain('window.location.assign(productHref)');
    expect(source).not.toContain('€180');
    expect(source).not.toContain('EUR 180');
    expect(source).not.toContain('PROCESSING PAYMENT');
    expect(source).not.toContain('ORDER CONFIRMED');
    expect(source).not.toContain("setSurface('cart')");
    expect(source).not.toContain('CONTINUE TO CHECKOUT');
    expect(source).not.toContain('ORDER —');
    expect(source).not.toContain('userScrollIntent');
  });

  it('uses one authoritative size selector and a bounded quantity stepper', () => {
    const source = readFileSync(
      'apps/web/src/components/product/ProductForm/index.tsx',
      'utf8'
    );
    const stepperSource = readFileSync(
      'packages/design-system/components/QuantityStepper/index.tsx',
      'utf8'
    );
    const productInfoSource = readFileSync(
      'apps/web/src/components/product/ProductInfo/index.tsx',
      'utf8'
    );

    expect(source).toContain('name="referenceHash"');
    expect(source).not.toContain('<select');
    expect(source).toContain('<QuantityStepper');
    expect(stepperSource).toContain('Decrease quantity');
    expect(stepperSource).toContain('Increase quantity');
    expect(source).toContain('ADD TO BAG -');
    expect(source).toContain("'CHOOSE A SIZE'");
    expect(source).toContain(
      'Final sale · Shipping details available at checkout'
    );
    expect(productInfoSource).toContain('.map((size) => size.toUpperCase())');
    expect(source).toContain('data-purchase-state="sold-out"');
    expect(source).toContain('SOLD OUT');
    expect(source).not.toContain('ADD TO TEST BAG');
  });

  it('keeps normal vertical scrolling across workbook and commerce pages', () => {
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );

    expect(styles).toMatch(/html\s*\{[^}]*scroll-snap-type:\s*none;/s);
    expect(styles).toMatch(
      /html:has\(\.cp-workbook-site\)\s*\{[^}]*scroll-snap-type:\s*none;/s
    );
    expect(styles).not.toContain('scroll-snap-type: y mandatory');
  });

  it('keeps action foreground and background swaps contrast-safe', () => {
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );

    const actionRule =
      [...styles.matchAll(/\.cp-action\s*\{[^}]*\}/gs)]
        .map(([rule]) => rule)
        .find((rule) => rule.includes('transition:')) || '';
    expect(actionRule).toContain(
      'transition: border-color var(--cp-duration-standard) var(--cp-ease-standard);'
    );
    expect(actionRule).not.toContain('transition: background');
    expect(actionRule).not.toContain(',\n      color ');
  });
});
