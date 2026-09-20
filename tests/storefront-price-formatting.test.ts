import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatCatalogPrice } from '../apps/web/src/components/editorial/WorkbookReplica';

const ACTIVE_PRICE_FORMATTERS = [
  'apps/web/src/components/commerce/catalog-state.tsx',
  'apps/web/src/components/product/ProductForm/index.tsx',
  'apps/web/src/components/product/ProductInfo/index.tsx',
];

describe('storefront price formatting', () => {
  it('always renders exactly two fraction digits', () => {
    expect(formatCatalogPrice(14.34, 'USD')).toBe('$14.34');
    expect(formatCatalogPrice(128, 'USD')).toBe('$128.00');
    expect(formatCatalogPrice(0, 'USD')).toBe('$0.00');
    expect(formatCatalogPrice(128.5, 'USD')).toBe('$128.50');
    expect(formatCatalogPrice(1280, 'USD')).toBe('$1,280.00');
  });

  it('uses the same precision policy across active commerce surfaces', () => {
    for (const path of ACTIVE_PRICE_FORMATTERS) {
      const source = readFileSync(path, 'utf8');
      expect(source).toContain('minimumFractionDigits: 2');
      expect(source).toContain('maximumFractionDigits: 2');
    }
  });
});
