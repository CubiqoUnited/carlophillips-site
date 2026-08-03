import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('storefront route policy', () => {
  it('keeps home bound to the shared server catalog decision', () => {
    const source = readFileSync('app/page.js', 'utf8');
    expect(source).toContain('getServerCatalogDecision');
    expect(source).toContain('toHomeCatalogSummary');
    expect(source).toContain('components/storefront/home-storefront');
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
    const source = readFileSync('components/storefront/home-storefront.jsx', 'utf8');
    expect(source).not.toContain('signature-hoodie-preview');
    expect(source).not.toContain('loadShopifyProduct');
    expect(source).not.toContain('SHOPIFY_');
    expect(source).not.toContain('Add to bag');
    expect(source).toContain('not product or media proof');
  });

  it('publishes only active product and commerce routes in the sitemap', () => {
    const source = readFileSync('app/sitemap.js', 'utf8');
    const robots = readFileSync('app/robots.js', 'utf8');
    expect(source).toContain('/shop');
    expect(source).toContain('/collections');
    expect(source).not.toContain('/about');
    expect(source).not.toContain('/lookbook');
    expect(robots).not.toContain('/about');
    expect(robots).not.toContain('/lookbook');
  });
});
