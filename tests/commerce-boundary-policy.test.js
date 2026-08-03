import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeSources = [
  'app/page.js',
  'app/shop/page.js',
  'app/collections/page.js',
  'app/products/[handle]/page.js',
  'app/bag/page.js',
  'app/cart/page.js',
  'components/storefront/home-storefront.jsx',
  'components/commerce/catalog-boundary.jsx',
  'components/commerce/product-detail.jsx',
  'components/commerce/bag-state.jsx',
];

describe('active commerce boundary policy', () => {
  it('removes the dormant browser product and cart mutation paths', () => {
    for (const path of [
      'lib/data/products.js',
      'lib/store/cart.js',
      'lib/shopify/client.js',
      'lib/shopify/index.js',
      'lib/shopify/mutations.js',
      'lib/config/shopify.js',
    ]) {
      expect(existsSync(path), `${path} must remain absent`).toBe(false);
    }
  });

  it('keeps runtime routes and components away from low-level Shopify and legacy stores', () => {
    for (const path of runtimeSources) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toMatch(/lib\/(?:data\/products|store\/cart|shopify\/(?:client|index|mutations))/);
      expect(source, path).not.toMatch(/variant-resolution-(?:policy|server)/);
      expect(source, path).not.toMatch(/observedVariants|shopifyVariants|rawShopifyProduct/);
      expect(source, path).not.toContain('NEXT_PUBLIC_SHOPIFY_');
    }
  });

  it('keeps the Shopify product transport server-only and read-only', () => {
    const adapter = readFileSync('lib/providers/shopify/storefront-product-adapter.js', 'utf8');
    const loader = readFileSync('lib/providers/shopify/product-loader.js', 'utf8');
    const combined = `${adapter}\n${loader}`;

    expect(adapter).toContain("import 'server-only'");
    expect(combined).toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(adapter).toContain('SHOPIFY_PRODUCT_READ_CAPABILITY_UNVERIFIED');
    expect(adapter).toContain('capabilityDecision.evidenceRef');
    expect(combined).not.toContain('NEXT_PUBLIC_SHOPIFY_');
    expect(combined).not.toMatch(/mutation\s+/);
    expect(combined).not.toMatch(/createCart|cartLinesAdd|cartLinesUpdate|cartLinesRemove/);
  });

  it('keeps raw Shopify variant resolution behind a server-only production entry', () => {
    const serverEntry = readFileSync(
      'lib/commerce/variant-resolution-server.js',
      'utf8'
    );
    const purePolicy = readFileSync(
      'lib/commerce/variant-resolution-policy.js',
      'utf8'
    );

    expect(serverEntry).toContain("import 'server-only'");
    expect(serverEntry).toContain('getServerVariantResolutionReadiness');
    expect(serverEntry).toContain('evaluateVariantResolutionReadiness');
    expect(serverEntry).not.toContain('console.');
    expect(purePolicy).not.toContain('console.');
    expect(readFileSync('lib/commerce/cart-activation-server.js', 'utf8'))
      .toContain('variantResolverDecision: null');
  });

  it('keeps public API routes from exposing catalog audit or mutation surfaces', () => {
    const source = readFileSync('app/api/[[...path]]/route.js', 'utf8');
    expect(source).not.toContain('media-audit');
    expect(source).not.toContain('premium-readiness');
    expect(source).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(source).not.toContain('products(first:');
    expect(source).toContain("commerceWrites: 'disabled'");
  });
});
