import { describe, expect, it } from 'vitest';
import { resolveBagDecision } from '../lib/commerce/bag-decision';
import { resolveStorefrontBagStatus } from '../apps/web/src/lib/commerce/bag-decision';

const unavailableActivation = {
  cartAllowed: false,
  reason: 'SHOPIFY_CART_CAPABILITY_UNVERIFIED',
};

const readyActivation = {
  cartAllowed: true,
  reason: null,
};

describe('bag decisions', () => {
  it('treats a retained Shopify cart with zero lines as empty', () => {
    expect(resolveStorefrontBagStatus({ available: true, lineCount: 0 })).toBe(
      'empty'
    );
    expect(resolveStorefrontBagStatus({ available: true, lineCount: 1 })).toBe(
      'ready'
    );
    expect(resolveStorefrontBagStatus({ available: false, lineCount: 0 })).toBe(
      'unavailable'
    );
  });

  it('uses a visibly non-commerce local preview when cart access is unverified', () => {
    expect(
      resolveBagDecision({
        environment: 'local',
        activationDecision: unavailableActivation,
      })
    ).toMatchObject({
      status: 'local_preview',
      source: 'fixture',
      commerceAllowed: false,
      checkoutAllowed: false,
      reason: 'SHOPIFY_CART_CAPABILITY_UNVERIFIED',
    });
  });

  it.each(['preview', 'production'])(
    'fails closed in %s when cart access is unverified',
    (environment) => {
      expect(
        resolveBagDecision({
          environment,
          activationDecision: unavailableActivation,
        })
      ).toMatchObject({
        status: 'unavailable',
        source: 'unavailable',
        commerceAllowed: false,
        checkoutAllowed: false,
      });
    }
  );

  it.each(['preview', 'production'])(
    'rejects fixture carts in %s',
    (environment) => {
      expect(
        resolveBagDecision({
          environment,
          activationDecision: readyActivation,
          cart: { source: 'fixture', items: [] },
        })
      ).toMatchObject({
        status: 'unavailable',
        reason: 'FIXTURE_CART_FORBIDDEN',
      });
    }
  );

  it('does not infer checkout approval from a Shopify cart', () => {
    expect(
      resolveBagDecision({
        environment: 'preview',
        activationDecision: readyActivation,
        cart: { source: 'shopify', items: [{ key: 'opaque-line' }] },
      })
    ).toMatchObject({
      status: 'ready',
      source: 'shopify',
      commerceAllowed: true,
      checkoutAllowed: false,
      reason: 'CHECKOUT_RELEASE_APPROVAL_REQUIRED',
    });
  });
});
