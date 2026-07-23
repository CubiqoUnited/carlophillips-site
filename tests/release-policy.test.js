import { describe, expect, it } from 'vitest';
import { resolveProductSource } from '../lib/commerce/release-policy.js';

const fixtureProduct = { id: 'fixture-1', title: 'Layout Fixture' };

describe('release source policy', () => {
  it('allows an explicitly labeled non-commerce fixture locally', () => {
    const decision = resolveProductSource({ environment: 'local', fixtureProduct });
    expect(decision).toMatchObject({
      status: 'available',
      source: 'fixture',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'LOCAL_NON_COMMERCE_FIXTURE',
    });
    expect(decision.product).toMatchObject({
      source: 'fixture',
      allowedEnvironment: 'local',
      commerceMode: 'non-commerce',
    });
  });

  it.each(['preview', 'production'])('returns unavailable instead of a fixture after Shopify failure in %s', environment => {
    const decision = resolveProductSource({
      environment,
      fixtureProduct,
      shopifyError: new Error('deliberate test failure'),
    });
    expect(decision).toEqual({
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'unavailable',
      source: 'unavailable',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'SHOPIFY_REQUEST_FAILED',
      product: null,
    });
  });

  it('uses a Shopify product as the only non-local product source', () => {
    const decision = resolveProductSource({
      environment: 'preview',
      shopifyProduct: { id: 'shopify-1', title: 'Observed product' },
      fixtureProduct,
    });
    expect(decision.source).toBe('shopify');
    expect(decision.product.source).toBe('shopify');
  });
});
