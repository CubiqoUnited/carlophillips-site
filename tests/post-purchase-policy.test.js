import { describe, expect, it } from 'vitest';
import {
  postPurchaseJourney,
  resolvePostPurchaseCapabilities,
} from '../apps/web/src/lib/commerce/post-purchase-policy.ts';

describe('post-purchase policy', () => {
  it('fails closed when Shopify-owned destinations are absent', () => {
    const capabilities = resolvePostPurchaseCapabilities({});
    expect(capabilities.account).toMatchObject({
      available: false,
      href: null,
    });
    expect(capabilities.returns.available).toBe(false);
    expect(capabilities.reviews.available).toBe(false);
    expect(capabilities.credit.available).toBe(false);
  });

  it('accepts only safe HTTPS destinations without embedded credentials', () => {
    const capabilities = resolvePostPurchaseCapabilities({
      NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL: 'https://shop.example.com/account',
      NEXT_PUBLIC_SHOPIFY_RETURNS_URL: 'http://shop.example.com/returns',
      NEXT_PUBLIC_SHOPIFY_REVIEW_URL:
        'https://username:password@shop.example.com/reviews',
    });
    expect(capabilities.account).toMatchObject({
      available: true,
      href: 'https://shop.example.com/account',
    });
    expect(capabilities.returns.available).toBe(false);
    expect(capabilities.reviews.available).toBe(false);
  });

  it('exposes CP Credit only through an authenticated Shopify account', () => {
    expect(
      resolvePostPurchaseCapabilities({
        NEXT_PUBLIC_SHOPIFY_CREDIT_ENABLED: 'true',
      }).credit.available
    ).toBe(false);
    expect(
      resolvePostPurchaseCapabilities({
        NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL: 'https://shop.example.com/account',
        NEXT_PUBLIC_SHOPIFY_CREDIT_ENABLED: 'true',
      }).credit
    ).toMatchObject({
      available: true,
      href: 'https://shop.example.com/account',
    });
  });

  it('names Shopify or its fulfillment provider as authority for every step', () => {
    expect(postPurchaseJourney).toHaveLength(5);
    expect(
      postPurchaseJourney.every((step) =>
        step.authority.toLowerCase().includes('shopify')
      )
    ).toBe(true);
  });
});
