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
      SHOPIFY_ACCOUNT_URL: 'https://shop.example.com/account',
      SHOPIFY_RETURNS_URL: 'http://shop.example.com/returns',
    });
    expect(capabilities.account).toMatchObject({
      available: true,
      href: 'https://shop.example.com/account',
    });
    expect(capabilities.returns.available).toBe(false);
    expect(capabilities.reviews.available).toBe(false);
  });

  it('rejects destination URLs containing query tokens or fragments', () => {
    expect(
      resolvePostPurchaseCapabilities({
        SHOPIFY_ACCOUNT_URL: 'https://shop.example.com/account?token=secret',
        SHOPIFY_RETURNS_URL: 'https://shop.example.com/returns#customer',
      }).account.available
    ).toBe(false);
  });

  it('never falls back to Production post-purchase URLs in Preview', () => {
    const capabilities = resolvePostPurchaseCapabilities(
      {
        SHOPIFY_ACCOUNT_URL: 'https://production.example/account',
        SHOPIFY_RETURNS_URL: 'https://production.example/returns',
      },
      'preview'
    );
    expect(capabilities.account.available).toBe(false);
    expect(capabilities.returns.available).toBe(false);
  });

  it('uses only dedicated Staging destinations in Preview', () => {
    expect(
      resolvePostPurchaseCapabilities(
        {
          SHOPIFY_STAGING_ACCOUNT_URL: 'https://staging.example/account',
          SHOPIFY_STAGING_RETURNS_URL: 'https://staging.example/returns',
        },
        'preview'
      )
    ).toMatchObject({
      account: { available: true, href: 'https://staging.example/account' },
      returns: { available: true, href: 'https://staging.example/returns' },
    });
  });

  it('requires authenticated delivered-order truth for reviews', () => {
    expect(resolvePostPurchaseCapabilities({}).reviews.available).toBe(false);
    expect(
      resolvePostPurchaseCapabilities({}, 'production', {
        authenticated: true,
        reviewEligibility: 'ineligible',
        reviewUrl: 'https://reviews.example/write',
        creditAccountAvailable: false,
      }).reviews.available
    ).toBe(false);
    expect(
      resolvePostPurchaseCapabilities({}, 'production', {
        authenticated: true,
        reviewEligibility: 'eligible',
        reviewUrl: 'https://reviews.example/write',
        creditAccountAvailable: false,
      }).reviews
    ).toMatchObject({
      available: true,
      href: 'https://reviews.example/write',
    });
  });

  it('exposes CP Credit only from authenticated Shopify account truth', () => {
    expect(resolvePostPurchaseCapabilities({}).credit.available).toBe(false);
    expect(
      resolvePostPurchaseCapabilities({}, 'production', {
        authenticated: true,
        reviewEligibility: 'unknown',
        creditAccountAvailable: true,
        creditUrl: 'https://shop.example.com/account/credit',
      }).credit
    ).toMatchObject({
      available: true,
      href: 'https://shop.example.com/account/credit',
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
