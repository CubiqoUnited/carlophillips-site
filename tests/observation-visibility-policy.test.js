import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import {
  attachObservationToProduct,
  createProductObservation,
} from '../apps/web/src/lib/commerce/product-observation.ts';
import { evaluateObservationVisibility } from '../apps/web/src/lib/commerce/observation-visibility-policy.ts';
import { createShopifyProductLoader } from '../apps/web/src/lib/providers/shopify/product-loader.ts';
import { createCompleteReleaseRecord } from './fixtures/release-fixtures.js';

const capabilityEvidence = 'evidence/shopify-storefront-read.json';

function productFacts(overrides = {}) {
  const {
    handle = 'test-product',
    name = 'Observed product',
    amount = '128.00',
    availableForSale = true,
    description = 'Observed description',
    vendor = 'Observed vendor',
    productType = 'Hoodie',
    tagline = 'SIGNATURE',
    details = ['Observed description'],
    variantId = 'sanitized-test-variant',
    variantTitle = 'Default Title',
    optionValue = 'Default Title',
  } = overrides;
  return {
    handle,
    name,
    description,
    vendor,
    productType,
    tagline,
    details,
    price: Number(amount),
    compareAtPrice: Number(amount),
    currency: 'USD',
    availableForSale,
    observedVariants: [
      {
        id: variantId,
        title: variantTitle,
        selectedOptions: [{ name: 'Title', value: optionValue }],
        availableForSale,
        price: { amount, currencyCode: 'USD' },
      },
    ],
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
  record.shopify.commerceFactsFingerprint =
    product.observation.commerceFactsFingerprint;
  record.shopify.observationFingerprint =
    product.observation.observationFingerprint;
  record.shopify.observationReviewEvidence =
    'approval/product-observation-review.json';
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
        descriptionHtml: '<p>Observed description</p>',
        productType: 'Hoodie',
        vendor: 'Observed vendor',
        tags: [],
        priceRange: {
          minVariantPrice: { amount: '128.00', currencyCode: 'USD' },
          maxVariantPrice: { amount: '128.00', currencyCode: 'USD' },
        },
        images: { edges: [] },
        media: { edges: [] },
        variants: {
          edges: [
            {
              node: {
                id: 'gid://shopify/ProductVariant/1',
                title: 'Default Title',
                availableForSale: true,
                price: { amount: '128.00', currencyCode: 'USD' },
                selectedOptions: [{ name: 'Title', value: 'Default Title' }],
              },
            },
          ],
        },
        options: [],
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
    expect(
      evaluateObservationVisibility({
        environment: 'production',
        shopifyProduct: current,
        releaseRecord,
      })
    ).toMatchObject({
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
    ['description', { description: 'Changed observed description' }],
    ['vendor', { vendor: 'Changed observed vendor' }],
    ['product type', { productType: 'Changed type' }],
    ['tagline', { tagline: 'CHANGED' }],
    ['details', { details: ['Changed observed detail'] }],
  ])(
    'withholds changed %s facts even when variant identity is otherwise stable',
    (_label, changes) => {
      const reviewed = observe();
      const releaseRecord = bindReviewedObservation(reviewed);
      const current = observe({
        observedAt: '2026-07-24T12:30:00Z',
        facts: productFacts(changes),
      });

      expect(
        evaluateObservationVisibility({
          environment: 'preview',
          shopifyProduct: current,
          releaseRecord,
        })
      ).toEqual({
        ready: false,
        reason: 'PRODUCT_COMMERCE_FACTS_STALE',
        product: null,
      });
    }
  );

  it('uses a specific stale reason when variant identity changes', () => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const current = observe({
      facts: productFacts({ variantId: 'different-sanitized-variant' }),
    });

    expect(
      evaluateObservationVisibility({
        environment: 'preview',
        shopifyProduct: current,
        releaseRecord,
      }).reason
    ).toBe('PRODUCT_VARIANT_FINGERPRINT_STALE');
  });

  it('derives every rendered Shopify copy field from the reviewed observation, not outer payload fields', () => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const current = observe({ observedAt: '2026-07-24T12:30:00Z' });
    Object.assign(current, {
      title: 'Injected outer title',
      name: 'Injected outer name',
      description: 'Injected outer description',
      vendor: 'Injected outer vendor',
      productType: 'Injected outer type',
      tagline: 'INJECTED',
      details: ['Injected outer detail'],
      story: 'Injected outer story',
      descriptionHtml: '<script>Injected outer HTML</script>',
    });

    const decision = evaluateObservationVisibility({
      environment: 'preview',
      shopifyProduct: current,
      releaseRecord,
    });

    expect(decision.ready).toBe(true);
    expect(decision.product).toMatchObject({
      id: 'test-product',
      handle: 'test-product',
      title: 'Observed product',
      name: 'Observed product',
      description: 'Observed description',
      vendor: 'Observed vendor',
      productType: 'Hoodie',
      tagline: 'SIGNATURE',
      details: ['Observed description'],
    });
    expect(JSON.stringify(decision.product)).not.toContain('Injected outer');
    expect(JSON.stringify(decision.product)).not.toContain('INJECTED');
    expect(decision.product).not.toHaveProperty('descriptionHtml');
    expect(decision.product).not.toHaveProperty('story');
  });

  it('denies tampered and missing observation envelopes without exposing a product', () => {
    const reviewed = observe();
    const releaseRecord = bindReviewedObservation(reviewed);
    const tampered = structuredClone(reviewed);
    tampered.observation.product.minimumPrice = 1;

    for (const shopifyProduct of [tampered, { handle: 'test-product' }]) {
      expect(
        evaluateObservationVisibility({
          environment: 'preview',
          shopifyProduct,
          releaseRecord,
        })
      ).toEqual({
        ready: false,
        reason: 'PRODUCT_OBSERVATION_INVALID',
        product: null,
      });
    }
  });

  it('keeps the actual dynamic-timestamp loader eligible when facts are unchanged', async () => {
    const timestamps = ['2026-07-23T05:00:00Z', '2026-07-23T05:00:01Z'];
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
    expect(
      evaluateObservationVisibility({
        environment: 'preview',
        shopifyProduct: current,
        releaseRecord,
      }).ready
    ).toBe(true);
  });
});
