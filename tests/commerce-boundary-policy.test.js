import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeSources = [
  'apps/web/src/app/(editorial)/page.tsx',
  'apps/web/src/app/shop/page.tsx',
  'apps/web/src/app/collections/page.tsx',
  'apps/web/src/app/product/[handle]/page.tsx',
  'apps/web/src/app/bag/page.tsx',
  'apps/web/src/app/cart/page.tsx',
  'apps/web/src/components/editorial/HomeStorefront/index.tsx',
  'apps/web/src/components/commerce/catalog-boundary.tsx',
  'apps/web/src/components/product/ProductInfo/index.tsx',
  'apps/web/src/components/commerce/bag-state.tsx',
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
      expect(source, path).not.toMatch(
        /lib\/(?:data\/products|store\/cart|shopify\/(?:client|index|mutations))/
      );
      expect(source, path).not.toMatch(/variant-resolution-(?:policy|server)/);
      expect(source, path).not.toMatch(
        /observedVariants|shopifyVariants|rawShopifyProduct/
      );
      expect(source, path).not.toContain('NEXT_PUBLIC_SHOPIFY_');
    }
  });

  it('keeps the Shopify product transport server-only and read-only', () => {
    const adapter = readFileSync(
      'apps/web/src/lib/providers/shopify/storefront-product-adapter.ts',
      'utf8'
    );
    const loader = readFileSync(
      'apps/web/src/lib/providers/shopify/product-loader.ts',
      'utf8'
    );
    const shopifyPackage = readFileSync(
      'packages/shopify/src/client.ts',
      'utf8'
    );
    const combined = `${adapter}\n${loader}\n${shopifyPackage}`;

    expect(adapter).toContain("import 'server-only'");
    expect(combined).toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(adapter).toContain('SHOPIFY_PRODUCT_READ_CAPABILITY_UNVERIFIED');
    expect(adapter).toContain('capabilityDecision.evidenceRef');
    expect(combined).not.toContain('NEXT_PUBLIC_SHOPIFY_');
    expect(combined).not.toMatch(/mutation\s+/);
    expect(combined).not.toMatch(
      /createCart|cartLinesAdd|cartLinesUpdate|cartLinesRemove/
    );
  });

  it('keeps raw Shopify variant resolution behind a server-only production entry', () => {
    const serverEntry = readFileSync(
      'apps/web/src/lib/commerce/variant-resolution-server.ts',
      'utf8'
    );
    const purePolicy = readFileSync(
      'apps/web/src/lib/commerce/variant-resolution-policy.ts',
      'utf8'
    );

    expect(serverEntry).toContain("import 'server-only'");
    expect(serverEntry).toContain('getServerVariantResolutionReadiness');
    expect(serverEntry).toContain('evaluateVariantResolutionReadiness');
    expect(serverEntry).not.toContain('console.');
    expect(purePolicy).not.toContain('console.');
    expect(
      readFileSync(
        'apps/web/src/lib/commerce/cart-activation-server.ts',
        'utf8'
      )
    ).toContain('variantResolverDecision = null');
  });

  it('keeps checkout server-only and fail-closed without a Shopify mutation surface', () => {
    const serverEntry = readFileSync(
      'apps/web/src/lib/commerce/shopify-checkout-server.ts',
      'utf8'
    );
    const route = readFileSync(
      'apps/web/src/app/api/checkout/route.ts',
      'utf8'
    );
    const form = readFileSync(
      'apps/web/src/components/product/ProductForm/index.tsx',
      'utf8'
    );

    expect(serverEntry).toContain("import 'server-only'");
    expect(serverEntry).not.toContain('cartCreate');
    expect(serverEntry).toContain('PRODUCT_RELEASE_NOT_RELEASED');
    expect(serverEntry).toContain(
      'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION'
    );
    expect(serverEntry).not.toContain('console.');
    expect(route).toContain('getProductReleaseEvidence');
    expect(route).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(route).not.toContain('merchandiseId');
    expect(form).not.toContain('gid://');
    expect(form).not.toContain('variantId');
  });

  it('keeps public API routes from exposing catalog audit or mutation surfaces', () => {
    const source = readFileSync(
      'apps/web/src/app/api/[[...path]]/route.ts',
      'utf8'
    );
    expect(source).not.toContain('media-audit');
    expect(source).not.toContain('premium-readiness');
    expect(source).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(source).not.toContain('products(first:');
    expect(source).toContain("commerceWrites: 'disabled'");
  });
});
