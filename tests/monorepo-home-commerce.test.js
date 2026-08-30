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
    expect(source).toContain('{productDescription}');
    expect(source).toContain('window.location.assign(productHref)');
    expect(source).not.toContain('€180');
    expect(source).not.toContain('EUR 180');
    expect(source).not.toContain('PROCESSING PAYMENT');
    expect(source).not.toContain('ORDER CONFIRMED');
    expect(source).not.toContain("setSurface('cart')");
  });

  it('keeps mandatory snap scrolling on the workbook without trapping commerce pages', () => {
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );

    expect(styles).toMatch(/html\s*\{[^}]*scroll-snap-type:\s*none;/s);
    expect(styles).toMatch(
      /html:has\(\.cp-workbook-site\)\s*\{[^}]*scroll-snap-type:\s*y mandatory;/s
    );
  });
});
