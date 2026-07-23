import { describe, expect, it, vi } from 'vitest';
import {
  attachObservationToProduct,
  createProductObservation,
} from '../lib/commerce/product-observation.js';
import { evaluateObservationVisibility } from '../lib/commerce/observation-visibility-policy.js';
import { createShopifyProductLoader } from '../lib/providers/shopify/product-loader.js';
import { createCompleteReleaseRecord } from './fixtures/release-fixtures.js';

const capabilityEvidence = 'evidence/shopify-storefront-read.json';

function productFacts(overrides = {}) {
  const {
    handle = 'test-product',
    name = 'Observed product',
    amount = '128.00',
    availableForSale = true,
    variantId = 'sanitized-test-variant',
    variantTitle = 'Default Title',
    optionValue = 'Default Title',
  } = overrides;
  return {
    handle,
    name,
    price: Number(amount),
    compareAtPrice: Number(amount),
    currency: 'USD',
    availableForSale,
    observedVariants: [{
      id: variantId,
      title: variantTitle,
      selectedOptions: [{ name: 'Title', value: optionValue }],
      availableForSale,
      price: { amount, currencyCode: 'USD' },
    }],
  };
}

function observe({
  environment = 'preview',
  observedAt = '2026-07-23T05:00:00Z',
  facts = productFacts(),
} = {}) {
  const observation = createProductObservation({
    source: 'shopify',
    environment,
    observedAt,
    product: facts,
    capabilityEvidence,
  });
  return attachObservationToProduct(facts, observation);
}

function bindReviewedObservation(product, state = 'staged') {
  const record = createCompleteReleaseRecord(state);
  record.shopify.handle = product.handle;
  record.shopify.observedAt = product.observation.observedAt;
  record.shopify.variantFingerprint = product.observation.variantFingerprint;
  record.shopify.commerceFactsFingerprint = product.observation.commerceFactsFingerprint;
  record.shopify.observationFingerprint = product.observation.observationFingerprint;
  record.shopify.observationReviewEvidence = 'approval/product-observation-review.json';
  return record;
}

function storefrontPayload() {
  return {
    data: {
      product: {
        id: 'gid://shopify/Product/1',
        handle: 'test-product',
        title: 'Observed product',
        description: 'Observed description',
        productType: 'Hoodie',
        tags: [],
        priceRange: {
          minVariantPrice: { amount: '128.00', currencyCode: 'USD' },
          maxVariantPrice: { amount: '128.00', currencyCode: 'USD' },
        },
        images: { edges: [] },
        media: { edges: [] },
        variants: {
          edges: [{
            node: {
              id: 'gid://shopify/ProductVariant/1',
              title: 'Default Title',
              availableForSale: true,
              price: { amount: '128.00', currencyCode: 'USD' },
              selectedOptions: [{ name: 'Title', value: 'Default Title' }],
            },
          }],
        },
      },
    },
  };
}

describe('release-bound observation visibility', () => {
  it('allows unchanged commerce facts across new timestamps and environments', () => {
    const reviewed = observe({
      environment: 'preview',
      observedAt: '2026-07-23T05:00:00Z',
    });
    const releaseRecord = bindReviewedObservation(reviewed, 'released');
    const current = observe({
      environment: 'production',
      observedAt: '2026-07-24T12:30:00Z',
    });

    expect(current.observation.observationFingerprint).not.toBe(
      reviewed.observation.observationFingerprint
    );
    expect(current.observation.commerceFactsFingerprint).toBe(
      reviewed.observation.commerceFactsFingerprint
    );
    expect(evaluateObservationVisibility({
      environment: 'production',
      shopifyProduct: current,
      releaseRecord,
    })).toMatchObject({
      ready: true,
      product: {
        price: 128,
        currency: 'USD',
        availableForSale: true,
      },
    });
  });

  it.each([
    ['price', { amount: '129.00' }],
    ['availability', { availableForSale: false }],
    ['title', { name: 'Changed observed product' }],
  ])('withholds changed %s facts even when variant identity is otherwise stable', (_label, changes) => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const current = observe({
      observedAt: '2026-07-24T12:30:00Z',
      facts: productFacts(changes),
    });

    expect(evaluateObservationVisibility({
      environment: 'preview',
      shopifyProduct: current,
      releaseRecord,
    })).toEqual({
      ready: false,
      reason: 'PRODUCT_COMMERCE_FACTS_STALE',
      product: null,
    });
  });

  it('uses a specific stale reason when variant identity changes', () => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const current = observe({
      facts: productFacts({ variantId: 'different-sanitized-variant' }),
    });

    expect(evaluateObservationVisibility({
      environment: 'preview',
      shopifyProduct: current,
      releaseRecord,
    }).reason).toBe('PRODUCT_VARIANT_FINGERPRINT_STALE');
  });

  it('denies tampered and missing observation envelopes without exposing a product', () => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const tampered = structuredClone(reviewed);
    tampered.observation.product.minimumPrice = 1;

    for (const shopifyProduct of [tampered, { handle: 'test-product' }]) {
      expect(evaluateObservationVisibility({
        environment: 'preview',
        shopifyProduct,
        releaseRecord,
      })).toEqual({
        ready: false,
        reason: 'PRODUCT_OBSERVATION_INVALID',
        product: null,
      });
    }
  });

  it('keeps the actual dynamic-timestamp loader eligible when facts are unchanged', async () => {
    const timestamps = [
      '2026-07-23T05:00:00Z',
      '2026-07-23T05:00:01Z',
    ];
    const loadProduct = createShopifyProductLoader({
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => storefrontPayload(),
      }),
      environment: 'preview',
      observedAt: () => timestamps.shift(),
      capabilityEvidence,
    });
    const reviewed = await loadProduct('test-product');
    const releaseRecord = bindReviewedObservation(reviewed);
    const current = await loadProduct('test-product');

    expect(current.observation.observationFingerprint).not.toBe(
      reviewed.observation.observationFingerprint
    );
    expect(evaluateObservationVisibility({
      environment: 'preview',
      shopifyProduct: current,
      releaseRecord,
    }).ready).toBe(true);
  });
});
