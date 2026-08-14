import { describe, expect, it } from 'vitest';
import {
  createVariantPresentation,
  hasSellableReviewedVariant,
} from '../apps/web/src/lib/commerce/variant-presentation-policy.ts';
import { createProductObservation } from '../apps/web/src/lib/commerce/product-observation.ts';

function observation() {
  return {
    variantFingerprint: `sha256:${'f'.repeat(64)}`,
    product: { currency: 'USD' },
    variants: [
      {
        referenceHash: `sha256:${'a'.repeat(64)}`,
        title: 'Black / M',
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'M' },
        ],
        availableForSale: true,
        price: { amount: '128.00', currency: 'USD' },
      },
      {
        referenceHash: `sha256:${'b'.repeat(64)}`,
        title: 'Black / L',
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'L' },
        ],
        availableForSale: false,
        price: { amount: '128.00', currency: 'USD' },
      },
    ],
  };
}

function readiness(presentation, overrides = {}) {
  return hasSellableReviewedVariant(presentation, {
    expectedVariantFingerprint: presentation.variantFingerprint,
    productVariantFingerprint: presentation.variantFingerprint,
    productCurrency: presentation.currency,
    ...overrides,
  });
}

describe('review-only variant presentation', () => {
  it('preserves exact reviewed combinations and availability without raw IDs or authority', () => {
    const presentation = createVariantPresentation(observation());

    expect(presentation).toMatchObject({
      schemaVersion: 'cp.variant-presentation.v1',
      source: 'reviewed-product-observation',
      variantFingerprint: `sha256:${'f'.repeat(64)}`,
      currency: 'USD',
      selectionAllowed: false,
      cartAuthority: false,
      optionNames: ['Color', 'Size'],
    });
    expect(
      presentation.combinations.map((item) => ({
        title: item.title,
        selectedOptions: item.selectedOptions,
        availableForSale: item.availableForSale,
      }))
    ).toEqual([
      {
        title: 'Black / M',
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'M' },
        ],
        availableForSale: true,
      },
      {
        title: 'Black / L',
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'L' },
        ],
        availableForSale: false,
      },
    ]);
    expect(JSON.stringify(presentation)).not.toContain('gid://');
    expect(readiness(presentation)).toBe(true);
  });

  it('projects raw non-alphabetical Shopify options only after observation canonicalization', () => {
    const canonicalObservation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt: '2026-07-23T12:00:00Z',
      capabilityEvidence: 'evidence/shopify-storefront-read-001',
      product: {
        handle: 'signature-hoodie',
        name: 'Signature Hoodie',
        description: 'Observed hoodie facts.',
        vendor: 'Observed vendor',
        productType: 'Hoodie',
        tagline: 'SIGNATURE',
        details: ['Observed construction detail.'],
        currency: 'USD',
        price: 128,
        compareAtPrice: 128,
        availableForSale: true,
        observedVariants: [
          {
            id: 'gid://shopify/ProductVariant/100',
            title: 'M / Black',
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Black' },
            ],
            availableForSale: true,
            price: { amount: '128.00', currencyCode: 'USD' },
          },
        ],
      },
    });

    expect(
      canonicalObservation.variants[0].selectedOptions.map(
        (option) => option.name
      )
    ).toEqual(['Color', 'Size']);
    const presentation = createVariantPresentation(canonicalObservation);
    expect(presentation.optionNames).toEqual(['Color', 'Size']);
    expect(
      presentation.combinations[0].selectedOptions.map((option) => option.name)
    ).toEqual(['Color', 'Size']);
    expect(readiness(presentation)).toBe(true);
  });

  it.each([
    [
      'selection authority',
      (value) => {
        value.selectionAllowed = true;
      },
    ],
    [
      'cart authority',
      (value) => {
        value.cartAuthority = true;
      },
    ],
    [
      'raw or malformed reference',
      (value) => {
        value.combinations[0].referenceHash = 'gid://shopify/ProductVariant/1';
      },
    ],
    [
      'duplicate reference',
      (value) => {
        value.combinations[1].referenceHash =
          value.combinations[0].referenceHash;
      },
    ],
    [
      'invalid option',
      (value) => {
        value.combinations[0].selectedOptions = [];
      },
    ],
    [
      'invalid price',
      (value) => {
        value.combinations[0].price.amount = '-1';
      },
    ],
  ])(
    'does not treat a presentation with %s as a sellable reviewed mapping',
    (_label, mutate) => {
      const presentation = createVariantPresentation(observation());
      mutate(presentation);
      expect(readiness(presentation)).toBe(false);
    }
  );

  it('returns false when every reviewed combination is unavailable', () => {
    const value = observation();
    value.variants.forEach((variant) => {
      variant.availableForSale = false;
    });
    const presentation = createVariantPresentation(value);
    expect(readiness(presentation)).toBe(false);
  });

  it.each([
    [
      'duplicate option signature',
      (presentation) => {
        presentation.combinations[1].selectedOptions = structuredClone(
          presentation.combinations[0].selectedOptions
        );
      },
    ],
    [
      'missing option dimension',
      (presentation) => {
        presentation.combinations[1].selectedOptions.pop();
      },
    ],
    [
      'extra option dimension',
      (presentation) => {
        presentation.combinations[1].selectedOptions.push({
          name: 'Material',
          value: 'Cotton',
        });
      },
    ],
    [
      'mismatched optionNames',
      (presentation) => {
        presentation.optionNames = ['Color', 'Material'];
      },
    ],
    [
      'mismatched currency',
      (presentation) => {
        presentation.combinations[0].price.currency = 'EUR';
      },
    ],
    [
      'non-canonical optionNames',
      (presentation) => {
        presentation.optionNames = ['Size', 'Color'];
      },
    ],
    [
      'non-canonical option order',
      (presentation) => {
        presentation.combinations[0].selectedOptions.reverse();
      },
    ],
    [
      'case-ambiguous option names',
      (presentation) => {
        presentation.optionNames = ['Color', 'color'];
        presentation.combinations.forEach((combination) => {
          combination.selectedOptions = [
            { name: 'Color', value: 'Black' },
            { name: 'color', value: 'Navy' },
          ];
        });
      },
    ],
    [
      'untrimmed option value',
      (presentation) => {
        presentation.combinations[0].selectedOptions[0].value = ' Black ';
      },
    ],
  ])('rejects %s', (_label, mutate) => {
    const presentation = createVariantPresentation(observation());
    mutate(presentation);
    expect(readiness(presentation)).toBe(false);
  });

  it('rejects a presentation not bound to both current product and release fingerprints', () => {
    const presentation = createVariantPresentation(observation());
    expect(
      readiness(presentation, {
        expectedVariantFingerprint: `sha256:${'e'.repeat(64)}`,
      })
    ).toBe(false);
    expect(
      readiness(presentation, {
        productVariantFingerprint: `sha256:${'d'.repeat(64)}`,
      })
    ).toBe(false);
    expect(
      readiness(presentation, {
        productCurrency: 'EUR',
      })
    ).toBe(false);
  });
});
