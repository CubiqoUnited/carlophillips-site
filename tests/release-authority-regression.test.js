import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createApprovedHoodieCheckout } from '../apps/web/src/lib/commerce/shopify-checkout-server.ts';
import { resolveProductSource } from '../apps/web/src/lib/commerce/release-policy.ts';
import { getProductReleaseEvidence } from '../apps/web/src/lib/releases/product-release-registry.ts';
import { createObservedShopifyProduct } from './fixtures/release-fixtures.js';

const HOODIE_HANDLE = 'carlophillips-signature-hoodie';
const VALID_REFERENCE = `sha256:${'0'.repeat(64)}`;

describe('canonical release authority regression', () => {
  it('has no standalone production commerce launch authority', () => {
    expect(existsSync('config/production-commerce-launch.json')).toBe(false);
    expect(
      existsSync('apps/web/src/lib/commerce/single-product-launch-policy.js')
    ).toBe(false);

    for (const file of [
      'apps/web/src/lib/commerce/release-policy.ts',
      'apps/web/src/lib/commerce/product-page-server.ts',
      'apps/web/src/lib/commerce/cart-activation-policy.ts',
      'apps/web/src/lib/commerce/shopify-checkout-server.ts',
    ]) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toContain('SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED');
      expect(source).not.toContain('truthful-current-shopify-media-only');
    }
  });

  it('denies production visibility for the canonical Draft release', () => {
    const evidence = getProductReleaseEvidence(HOODIE_HANDLE);
    const decision = resolveProductSource({
      environment: 'production',
      shopifyProduct: createObservedShopifyProduct(HOODIE_HANDLE, 'production'),
      ...evidence,
    });

    expect(evidence.releaseRecord.state).toBe('draft');
    expect(
      evidence.mediaManifest.assets.every(
        (asset) => asset.storefrontBinding === null
      )
    ).toBe(true);
    expect(decision).toMatchObject({
      status: 'denied',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
      product: null,
    });
  });

  it('blocks checkout before any Shopify read or mutation while the canonical release is Draft', async () => {
    const result = await createApprovedHoodieCheckout({
      handle: HOODIE_HANDLE,
      referenceHash: VALID_REFERENCE,
      quantity: 1,
      ...getProductReleaseEvidence(HOODIE_HANDLE),
    });

    expect(result).toEqual({
      ok: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
    });
  });

  it('rejects unknown release evidence and malformed selections', async () => {
    await expect(
      createApprovedHoodieCheckout({
        handle: 'unknown-product',
        referenceHash: VALID_REFERENCE,
        quantity: 1,
      })
    ).resolves.toEqual({
      ok: false,
      reason: 'PRODUCT_RELEASE_EVIDENCE_REQUIRED',
    });

    await expect(
      createApprovedHoodieCheckout({
        handle: HOODIE_HANDLE,
        referenceHash: 'not-a-hash',
        quantity: 1,
        ...getProductReleaseEvidence(HOODIE_HANDLE),
      })
    ).resolves.toEqual({ ok: false, reason: 'INVALID_CHECKOUT_SELECTION' });
  });
});
