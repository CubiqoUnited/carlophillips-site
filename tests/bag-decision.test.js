import { describe, expect, it } from 'vitest';
import { resolveBagDecision } from '../lib/commerce/bag-decision';

const unavailableCapability = {
  status: 'human_required',
  reason: 'SHOPIFY_CART_CAPABILITY_UNVERIFIED',
};

const readyCapability = {
  status: 'ready',
  reason: null,
};

describe('bag decisions', () => {
  it('uses a visibly non-commerce local preview when cart access is unverified', () => {
    expect(resolveBagDecision({
      environment: 'local',
      capabilityDecision: unavailableCapability,
    })).toMatchObject({
      status: 'local_preview',
      source: 'fixture',
      commerceAllowed: false,
      checkoutAllowed: false,
      reason: 'SHOPIFY_CART_CAPABILITY_UNVERIFIED',
    });
  });

  it.each(['preview', 'production'])('fails closed in %s when cart access is unverified', environment => {
    expect(resolveBagDecision({
      environment,
      capabilityDecision: unavailableCapability,
    })).toMatchObject({
      status: 'unavailable',
      source: 'unavailable',
      commerceAllowed: false,
      checkoutAllowed: false,
    });
  });

  it.each(['preview', 'production'])('rejects fixture carts in %s', environment => {
    expect(resolveBagDecision({
      environment,
      capabilityDecision: readyCapability,
      cart: { source: 'fixture', items: [] },
    })).toMatchObject({
      status: 'unavailable',
      reason: 'FIXTURE_CART_FORBIDDEN',
    });
  });

  it('does not infer checkout approval from a Shopify cart', () => {
    expect(resolveBagDecision({
      environment: 'preview',
      capabilityDecision: readyCapability,
      cart: { source: 'shopify', items: [{ key: 'opaque-line' }] },
    })).toMatchObject({
      status: 'ready',
      source: 'shopify',
      commerceAllowed: true,
      checkoutAllowed: false,
      reason: 'CHECKOUT_RELEASE_APPROVAL_REQUIRED',
    });
  });
});
