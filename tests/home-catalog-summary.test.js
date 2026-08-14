import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import schema from '../contracts/home-catalog-summary.schema.json';
import { toHomeCatalogSummary } from '../apps/web/src/lib/commerce/home-catalog-summary.ts';

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
    products: [
      {
        handle: 'carlophillips-signature-hoodie',
        title: 'CARLOPHILLIPS Signature Hoodie',
        description:
          'Heavyweight black pullover hoodie with restrained CP chest embroidery. Built with structured fleece and a soft interior.',
        details: ['Everyday core layer.'],
        sourceLabel: 'Local fixture review — not Shopify live data',
        commerceAllowed: false,
        media: [
          {
            id: 'approved-front-view',
            registryAssetId: 'approved-front-view',
            approvalStatus: 'approved',
            sourceAuthority: 'product-release-media-registry',
            type: 'image',
            url: 'https://cdn.example/approved-front.jpg',
            previewUrl: 'https://cdn.example/approved-front.jpg',
            alt: 'Approved Signature Hoodie front view',
            label: 'front',
            modalities: ['front'],
          },
        ],
      },
    ],
    ...overrides,
  };
}

function expectValid(summary) {
  expect(validate(summary), JSON.stringify(validate.errors)).toBe(true);
  expect(summary.candidateCount).toBe(
    summary.visibleCount + summary.excludedCount
  );
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
        href: '/product/carlophillips-signature-hoodie',
        commerceAllowed: false,
        description:
          'Heavyweight black pullover hoodie with restrained CP chest embroidery. Built with structured fleece and a soft interior.',
        heroMedia: {
          url: 'https://cdn.example/approved-front.jpg',
        },
        media: [
          {
            type: 'image',
            url: 'https://cdn.example/approved-front.jpg',
            previewUrl: 'https://cdn.example/approved-front.jpg',
            label: 'Product still',
          },
        ],
      },
    });
    expect(summary.message).toContain('local non-commerce fixture');
    expect(Object.keys(summary.primaryProduct).sort()).toEqual([
      'commerceAllowed',
      'description',
      'heroMedia',
      'href',
      'media',
      'sourceLabel',
      'title',
    ]);
    expect(JSON.stringify(summary)).toContain('approved-front-view');
    expect(JSON.stringify(summary)).not.toContain('approval pending');
  });

  it('passes only the reviewed description without deriving presentation claims', () => {
    const summary = toHomeCatalogSummary(
      decision({
        products: [
          {
            ...decision().products[0],
            description: 'A restrained black pullover for everyday layering.',
            details: [],
          },
        ],
      })
    );

    expectValid(summary);
    expect(summary.primaryProduct.description).toContain(
      'restrained black pullover'
    );
    expect(summary.primaryProduct).not.toHaveProperty('highlights');
  });

  it('does not emit a product link or payload for a denied home decision', () => {
    const summary = toHomeCatalogSummary(
      decision({
        environment: 'production',
        status: 'denied',
        source: 'unavailable',
        visibleCount: 0,
        excludedCount: 1,
        reason: 'PRODUCT_VISIBILITY_GATE_CLOSED',
        excludedReasons: ['PRODUCT_VISIBILITY_GATE_CLOSED'],
        products: [],
      })
    );
    expectValid(summary);
    expect(summary.primaryProduct).toBeNull();
    expect(summary.message).toContain('release gate is closed');
    expect(JSON.stringify(summary)).not.toContain('Signature Hoodie');
  });

  it('keeps zero-candidate and mixed-count summaries truthful', () => {
    const zero = toHomeCatalogSummary(
      decision({
        environment: 'preview',
        status: 'unavailable',
        source: 'unavailable',
        candidateCount: 0,
        visibleCount: 0,
        excludedCount: 0,
        products: [],
      })
    );
    const mixed = toHomeCatalogSummary(
      decision({
        environment: 'preview',
        source: 'shopify',
        candidateCount: 3,
        visibleCount: 1,
        excludedCount: 2,
      })
    );
    expectValid(zero);
    expectValid(mixed);
    expect(zero.primaryProduct).toBeNull();
    expect(JSON.stringify(zero)).not.toContain('editorial-02.jpg');
    expect(mixed.message).toContain(
      '1 private Staged-or-later release candidate'
    );
  });

  it('keeps customer-facing availability copy provider-neutral', () => {
    const preview = toHomeCatalogSummary(
      decision({
        environment: 'preview',
        source: 'shopify',
        commerceAllowed: true,
      })
    );
    const production = toHomeCatalogSummary(
      decision({
        environment: 'production',
        source: 'shopify',
        commerceAllowed: true,
      })
    );

    expect(preview.message.toLowerCase()).not.toContain('shopify');
    expect(production.message.toLowerCase()).not.toContain('shopify');
  });
});
