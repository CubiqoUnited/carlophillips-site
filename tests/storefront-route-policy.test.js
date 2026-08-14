import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('storefront route policy', () => {
  it('keeps home bound to the shared server catalog decision', () => {
    const source = readFileSync(
      'apps/web/src/app/(editorial)/page.tsx',
      'utf8'
    );
    expect(source).toContain('getServerCatalogDecision');
    expect(source).toContain('toHomeCatalogSummary');
    expect(source).toContain('components/editorial/HomeStorefront');
    expect(source).not.toContain('signature-hoodie-preview');
  });

  it('removes the editorial shell, editorial-only routes, and copy abstraction', () => {
    for (const path of [
      'components/editorial/app-shell.jsx',
      'app/about/page.js',
      'app/lookbook/page.js',
      'lib/content/index.js',
      'lib/content/site-content.js',
    ]) {
      expect(existsSync(path), `${path} must remain absent`).toBe(false);
    }
  });

  it('keeps the storefront client free of product fixtures and Shopify transport', () => {
    const source = readFileSync(
      'apps/web/src/components/editorial/HomeStorefront/index.tsx',
      'utf8'
    );
    expect(source).not.toContain('signature-hoodie-preview');
    expect(source).not.toContain('loadShopifyProduct');
    expect(source).not.toContain('SHOPIFY_');
    expect(source).not.toContain('Add to bag');
    expect(source).toContain('campaignAsset');
    expect(source).toContain('At the');
    expect(source).toContain('edge of life.');
    expect(source).toContain('Collection preview');
    expect(source).toContain('cp-media-withheld');
  });

  it('publishes only active product and commerce routes in the sitemap', () => {
    const source = readFileSync('apps/web/src/app/sitemap.ts', 'utf8');
    const robots = readFileSync('apps/web/src/app/robots.ts', 'utf8');
    expect(source).toContain('/shop');
    expect(source).toContain('/collections');
    expect(source).not.toContain('/about');
    expect(source).not.toContain('/lookbook');
    expect(robots).not.toContain('/about');
    expect(robots).not.toContain('/lookbook');
  });

  it('keeps site metadata aligned with the active Signature Series', () => {
    const source = readFileSync('apps/web/src/app/layout.tsx', 'utf8');
    expect(source).toContain("tagline: 'Signature Series'");
    expect(source).toContain(
      'CARLOPHILLIPS presents a restrained study in product, material, and editorial form.'
    );
    expect(source).not.toMatch(/secure checkout|live checkout/i);
    expect(source).not.toContain('Gesture of Luxury');
  });
});
