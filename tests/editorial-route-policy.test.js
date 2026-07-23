import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('editorial route data policy', () => {
  it('keeps the home server route bound to the shared catalog decision', () => {
    const source = readFileSync('app/page.js', 'utf8');
    expect(source).toContain('getServerCatalogDecision');
    expect(source).toContain('toHomeCatalogSummary');
    expect(source).not.toContain('signature-hoodie-preview');
  });

  it.each(['app/about/page.js', 'app/lookbook/page.js'])(
    'keeps %s editorial-only without a Shopify/catalog read',
    path => {
      const source = readFileSync(path, 'utf8');
      expect(source).toContain("components/editorial/app-shell");
      expect(source).not.toContain('getServerCatalogDecision');
      expect(source).not.toContain('loadShopifyProduct');
    }
  );

  it('removes fixture and release-state ownership from the client editorial shell', () => {
    const source = readFileSync('components/editorial/app-shell.jsx', 'utf8');
    expect(source).not.toContain('signature-hoodie-preview');
    expect(source).not.toContain('canRenderProducts');
    expect(source).not.toContain('canRenderDraftProductPreviews');
    expect(source).not.toContain('COMMERCE_DATA_MODE');
  });
});
