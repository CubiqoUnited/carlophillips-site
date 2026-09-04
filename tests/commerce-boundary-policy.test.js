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
      'lib/providers/shopify/storefront-product-adapter.js',
      'utf8'
    );
    const loader = readFileSync(
      'lib/providers/shopify/product-loader.js',
      'utf8'
    );
    const combined = `${adapter}\n${loader}`;

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
    expect(
      readFileSync('lib/commerce/cart-activation-server.js', 'utf8')
    ).toContain('variantResolverDecision = null');
  });

  it('keeps the Shopify-authoritative cart and checkout server-only and sanitized', () => {
    const serverEntry = readFileSync(
      'apps/web/src/lib/commerce/shopify-cart-server.ts',
      'utf8'
    );
    const route = readFileSync('apps/web/src/app/api/cart/route.ts', 'utf8');
    const environmentConfig = readFileSync(
      'apps/web/src/lib/config/shopify-environment.ts',
      'utf8'
    );
    const form = readFileSync(
      'apps/web/src/components/product/ProductForm/index.tsx',
      'utf8'
    );

    expect(serverEntry).toContain("import 'server-only'");
    expect(serverEntry).toContain('CREATE_CART');
    expect(serverEntry).toContain('ADD_CART_LINES');
    expect(serverEntry).toContain('UPDATE_CART_LINES');
    expect(serverEntry).toContain('REMOVE_CART_LINES');
    expect(serverEntry).not.toContain('releaseRecord');
    expect(serverEntry).not.toContain('variantFingerprint');
    expect(serverEntry).toContain('candidate.availableForSale');
    expect(serverEntry).toContain('trustedCartCheckoutUrl');
    expect(serverEntry).toContain('resolveShopifyStorefrontConfig');
    expect(environmentConfig).toContain("environment === 'preview'");
    expect(environmentConfig).toContain('SHOPIFY_STAGING_STORE_DOMAIN');
    expect(environmentConfig).toContain('SHOPIFY_STORE_DOMAIN');
    expect(serverEntry).not.toContain('console.');
    expect(route).toContain("const CART_COOKIE = 'cp_shopify_cart'");
    expect(route).toContain('response.cookies.set(CART_COOKIE');
    expect(route).toContain('httpOnly: true');
    expect(route).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(route).not.toContain('gid://');
    expect(form).not.toContain('gid://');
    expect(form).not.toContain('variantId');
  });

  it('keeps the mobile commerce entry and bag checkout actions discoverable', () => {
    const home = readFileSync(
      'apps/web/src/components/editorial/WorkbookReplica.tsx',
      'utf8'
    );
    const product = readFileSync(
      'apps/web/src/components/product/ProductInfo/index.tsx',
      'utf8'
    );
    const bag = readFileSync(
      'apps/web/src/components/commerce/bag-state.tsx',
      'utf8'
    );
    const bagActions = readFileSync(
      'apps/web/src/components/commerce/bag-actions.tsx',
      'utf8'
    );
    const styles = readFileSync(
      'packages/design-system/styles/globals.css',
      'utf8'
    );

    expect(home).toContain('cp-workbook-order-cta');
    expect(styles).not.toMatch(
      /\.cp-workbook-order-cta\s*\{[^}]*display:\s*none/s
    );
    expect(styles).toMatch(
      /html:has\(\.cp-workbook-site\)\s*\{[^}]*scroll-snap-type:\s*none/s
    );
    expect(styles).toContain('scroll-snap-stop: normal');
    expect(product).toContain('cp-commerce-buy-panel');
    expect(styles).toContain('(max-height: 52rem)');
    expect(styles).toMatch(
      /\.cp-commerce-detail\s*>\s*div:first-child\s*\{[^}]*order:\s*2/s
    );
    expect(bag).toContain('<BagCheckoutAction />');
    expect(bagActions).toContain('cp-bag-checkout-form');
    expect(bagActions).toContain('Opening checkout…');
    expect(bagActions).toContain('Retry checkout');
    expect(bagActions).toContain('This change was not saved.');
    expect(bagActions).toContain('if (pending) return');
    expect(bagActions).not.toContain('gid://');
    expect(styles).toMatch(
      /\.cp-bag-checkout-form\s*\{[^}]*position:\s*sticky/s
    );
  });

  it('retires the agent-authored controlled sample-order route', () => {
    const route = readFileSync(
      'app/api/admin/controlled-order/route.js',
      'utf8'
    );
    expect(route).toContain("requiredRole: 'product_owner'");
    expect(route).toContain('ORIGIN_REJECTED');
    expect(route).toContain('CONTROLLED_SAMPLE_ORDER_REMOVED');
    expect(route).not.toContain('request.formData');
    expect(route).not.toContain('SHOPIFY_STOREFRONT_TOKEN');
    expect(route).not.toContain('merchandiseId');
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
