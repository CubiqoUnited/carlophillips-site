import { describe, expect, it, vi } from 'vitest';
import {
  getProductDecision,
  resolveCommerceDataMode,
} from '../apps/web/src/lib/commerce/product-gateway.ts';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
  createObservedShopifyProduct,
} from './fixtures/release-fixtures.js';

const fixtureProduct = { handle: 'fixture-product', title: 'Fixture product' };

describe('product gateway', () => {
  it('defaults local to fixture and non-local environments to Shopify', () => {
    expect(resolveCommerceDataMode({ environment: 'local' })).toBe('fixture');
    expect(resolveCommerceDataMode({ environment: 'preview' })).toBe('shopify');
    expect(resolveCommerceDataMode({ environment: 'production' })).toBe(
      'shopify'
    );
  });

  it('returns a visibly non-commerce local fixture only in explicit fixture mode', async () => {
    const decision = await getProductDecision({
      environment: 'local',
      mode: 'fixture',
      handle: 'fixture-product',
      fixtureProduct,
    });
    expect(decision).toMatchObject({
      source: 'fixture',
      visibilityAllowed: true,
      commerceAllowed: false,
    });
  });

  it.each(['preview', 'production'])(
    'forbids fixture mode in %s',
    async (environment) => {
      const decision = await getProductDecision({
        environment,
        mode: 'fixture',
        handle: 'fixture-product',
        fixtureProduct,
      });
      expect(decision).toMatchObject({
        status: 'unavailable',
        source: 'unavailable',
        reason: 'FIXTURE_SOURCE_FORBIDDEN',
        product: null,
      });
    }
  );

  it('returns source-labeled Shopify data through the injected adapter', async () => {
    const loadShopifyProduct = vi
      .fn()
      .mockResolvedValue(
        createObservedShopifyProduct('test-product', 'preview')
      );
    const decision = await getProductDecision({
      environment: 'preview',
      mode: 'shopify',
      handle: 'test-product',
      releaseRecord: createCompleteReleaseRecord('staged'),
      mediaManifest: createCompleteMediaManifest(),
      loadShopifyProduct,
    });
    expect(loadShopifyProduct).toHaveBeenCalledWith('test-product');
    expect(decision).toMatchObject({
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
    });
    expect(decision.product.source).toBe('shopify');
  });

  it('denies a successful Shopify production observation backed only by a Draft record', async () => {
    const decision = await getProductDecision({
      environment: 'production',
      mode: 'shopify',
      handle: 'test-product',
      releaseRecord: createCompleteReleaseRecord('draft'),
      mediaManifest: createCompleteMediaManifest(),
      loadShopifyProduct: vi.fn().mockResolvedValue({ handle: 'test-product' }),
    });
    expect(decision).toMatchObject({
      status: 'denied',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
      product: null,
    });
  });

  it('does not substitute a fixture when Shopify throws', async () => {
    const decision = await getProductDecision({
      environment: 'preview',
      mode: 'shopify',
      handle: 'fixture-product',
      fixtureProduct,
      loadShopifyProduct: vi
        .fn()
        .mockRejectedValue(new Error('deliberate outage')),
    });
    expect(decision).toMatchObject({
      status: 'unavailable',
      source: 'unavailable',
      reason: 'SHOPIFY_REQUEST_FAILED',
      product: null,
    });
  });
});
