import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import schema from '../contracts/home-catalog-summary.schema.json';
import { toHomeCatalogSummary } from '../lib/commerce/home-catalog-summary.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

function decision(overrides = {}) {
  return {
    schemaVersion: 'cp.catalog-decision.v1',
    environment: 'local',
    status: 'available',
    source: 'fixture',
    candidateCount: 1,
    visibleCount: 1,
    excludedCount: 0,
    commerceAllowed: false,
    reason: 'CATALOG_ITEMS_AVAILABLE',
    excludedReasons: [],
    products: [{
      handle: 'carlophillips-signature-hoodie',
      title: 'CARLOPHILLIPS Signature Hoodie',
      sourceLabel: 'Local fixture review — not Shopify live data',
      commerceAllowed: false,
      media: [{
        type: 'image',
        url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
        alt: 'Signature Hoodie front candidate',
        label: 'Modelize product portrait · generated candidate · approval pending',
      }],
    }],
    ...overrides,
  };
}

function expectValid(summary) {
  expect(validate(summary), JSON.stringify(validate.errors)).toBe(true);
  expect(summary.candidateCount).toBe(summary.visibleCount + summary.excludedCount);
  expect(Boolean(summary.primaryProduct)).toBe(summary.visibleCount > 0);
}

describe('home catalog summary', () => {
  it('minimizes an eligible local catalog decision into a non-commerce review link', () => {
    const summary = toHomeCatalogSummary(decision());
    expectValid(summary);
    expect(summary).toMatchObject({
      candidateCount: 1,
      visibleCount: 1,
      excludedCount: 0,
      commerceAllowed: false,
      primaryProduct: {
        title: 'CARLOPHILLIPS Signature Hoodie',
        href: '/products/carlophillips-signature-hoodie',
        commerceAllowed: false,
        heroMedia: {
          url: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
        },
      },
    });
    expect(summary.message).toContain('local non-commerce fixture');
    expect(Object.keys(summary.primaryProduct).sort()).toEqual([
      'commerceAllowed',
      'heroMedia',
      'href',
      'sourceLabel',
      'title',
    ]);
  });

  it('does not emit a product link or payload for a denied home decision', () => {
    const summary = toHomeCatalogSummary(decision({
      environment: 'production',
      status: 'denied',
      source: 'unavailable',
      visibleCount: 0,
      excludedCount: 1,
      reason: 'PRODUCT_VISIBILITY_GATE_CLOSED',
      excludedReasons: ['PRODUCT_VISIBILITY_GATE_CLOSED'],
      products: [],
    }));
    expectValid(summary);
    expect(summary.primaryProduct).toBeNull();
    expect(summary.message).toContain('release gate is closed');
    expect(JSON.stringify(summary)).not.toContain('Signature Hoodie');
  });

  it('keeps zero-candidate and mixed-count summaries truthful', () => {
    const zero = toHomeCatalogSummary(decision({
      environment: 'preview',
      status: 'unavailable',
      source: 'unavailable',
      candidateCount: 0,
      visibleCount: 0,
      excludedCount: 0,
      products: [],
    }));
    const mixed = toHomeCatalogSummary(decision({
      environment: 'preview',
      source: 'shopify',
      candidateCount: 3,
      visibleCount: 1,
      excludedCount: 2,
    }));
    expectValid(zero);
    expectValid(mixed);
    expect(zero.primaryProduct).toBeNull();
    expect(JSON.stringify(zero)).not.toContain('editorial-02.jpg');
    expect(mixed.message).toContain('1 private Staged-or-later release candidate');
  });
});
