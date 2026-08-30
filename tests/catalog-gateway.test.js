import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it, vi } from 'vitest';
import catalogDecisionSchema from '../contracts/catalog-decision.schema.json';
import {
  closedCatalogDecision,
  getCatalogDecision,
  validateCatalogDecisionInvariants,
} from '../lib/commerce/catalog-gateway.js';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
  createObservedShopifyProduct,
} from './fixtures/release-fixtures.js';

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateCatalogDecision = ajv.compile(catalogDecisionSchema);

function releaseEvidence(
  state,
  handle = 'test-product',
  environment = state === 'released' ? 'production' : 'preview'
) {
  const releaseRecord = createCompleteReleaseRecord(state, {
    handle,
    environment,
  });
  const mediaManifest = createCompleteMediaManifest();
  return { releaseRecord, mediaManifest };
}

function expectValid(decision) {
  expect(
    validateCatalogDecision(decision),
    JSON.stringify(validateCatalogDecision.errors)
  ).toBe(true);
  expect(validateCatalogDecisionInvariants(decision)).toEqual([]);
  expect(decision.candidateCount).toBe(
    decision.visibleCount + decision.excludedCount
  );
  expect(decision.products).toHaveLength(decision.visibleCount);
}

describe('catalog gateway', () => {
  it('returns a truthful closed decision with no product payload', () => {
    const decision = closedCatalogDecision('production', 3);
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'denied',
      candidateCount: 3,
      visibleCount: 0,
      excludedCount: 3,
      commerceAllowed: false,
      products: [],
    });
  });

  it('shows explicitly local fixture candidates as non-commerce', async () => {
    const decision = await getCatalogDecision({
      environment: 'local',
      mode: 'fixture',
      candidateHandles: ['test-product'],
      fixtureProducts: [
        { handle: 'test-product', title: 'Local fixture', price: 10 },
      ],
      getReleaseEvidence: () => null,
      loadShopifyProduct: null,
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'available',
      source: 'fixture',
      candidateCount: 1,
      visibleCount: 1,
      excludedCount: 0,
      commerceAllowed: false,
    });
    expect(decision.products[0]).toMatchObject({
      handle: 'test-product',
      source: 'fixture',
      sourceLabel: 'Local presentation fixture — not live store data',
    });
  });

  it('does not expose fixture candidates in Preview', async () => {
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'fixture',
      candidateHandles: ['test-product'],
      fixtureProducts: [{ handle: 'test-product', title: 'Forbidden fixture' }],
      getReleaseEvidence: () => null,
      loadShopifyProduct: null,
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'unavailable',
      visibleCount: 0,
      excludedCount: 1,
      products: [],
      excludedReasons: ['FIXTURE_SOURCE_FORBIDDEN'],
    });
  });

  it('permits Preview only for a Staged-or-later Shopify observation', async () => {
    const loadShopifyProduct = vi.fn(async (handle) =>
      createObservedShopifyProduct(handle, 'preview')
    );
    const draft = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['test-product'],
      getReleaseEvidence: () => releaseEvidence('draft'),
      loadShopifyProduct,
    });
    const staged = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['test-product'],
      getReleaseEvidence: () => releaseEvidence('staged'),
      loadShopifyProduct,
    });
    expectValid(draft);
    expectValid(staged);
    expect(draft).toMatchObject({ status: 'unavailable', products: [] });
    expect(draft.excludedReasons).toEqual(['PRODUCT_RELEASE_NOT_STAGED']);
    expect(staged).toMatchObject({
      status: 'available',
      source: 'shopify',
      visibleCount: 1,
      commerceAllowed: false,
    });
  });

  it('permits production only for Released evidence and never purchasing', async () => {
    const loadShopifyProduct = vi.fn(async (handle) =>
      createObservedShopifyProduct(handle, 'production')
    );
    const approved = await getCatalogDecision({
      environment: 'production',
      mode: 'shopify',
      candidateHandles: ['test-product'],
      getReleaseEvidence: () => releaseEvidence('approved'),
      loadShopifyProduct,
    });
    const released = await getCatalogDecision({
      environment: 'production',
      mode: 'shopify',
      candidateHandles: ['test-product'],
      getReleaseEvidence: () => releaseEvidence('released'),
      loadShopifyProduct,
    });
    expectValid(approved);
    expectValid(released);
    expect(approved).toMatchObject({ status: 'unavailable', products: [] });
    expect(approved.excludedReasons).toEqual(['PRODUCT_RELEASE_NOT_RELEASED']);
    expect(released).toMatchObject({
      status: 'available',
      visibleCount: 1,
      commerceAllowed: false,
    });
    expect(released.products[0].commerceAllowed).toBe(false);
  });

  it('supports multiple records while excluding denied payloads and preserving truthful counts', async () => {
    const states = {
      'staged-product': 'staged',
      'draft-product': 'draft',
    };
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['staged-product', 'draft-product', 'staged-product'],
      getReleaseEvidence: (handle) => releaseEvidence(states[handle], handle),
      loadShopifyProduct: vi.fn(async (handle) => {
        const product = createObservedShopifyProduct(handle, 'preview');
        product.name =
          handle === 'staged-product'
            ? 'Visible staged candidate'
            : 'Secret denied candidate';
        return product;
      }),
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      candidateCount: 2,
      visibleCount: 1,
      excludedCount: 1,
      commerceAllowed: false,
    });
    expect(decision.products.map((product) => product.title)).toEqual([
      'Observed product',
    ]);
    expect(JSON.stringify(decision)).not.toContain('Secret denied candidate');
  });

  it('keeps zero-candidate counts and payloads internally consistent', async () => {
    const getReleaseEvidence = vi.fn();
    const loadShopifyProduct = vi.fn();
    const decision = await getCatalogDecision({
      environment: 'production',
      mode: 'shopify',
      candidateHandles: [],
      getReleaseEvidence,
      loadShopifyProduct,
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'unavailable',
      candidateCount: 0,
      visibleCount: 0,
      excludedCount: 0,
      excludedReasons: [],
      products: [],
    });
    expect(getReleaseEvidence).not.toHaveBeenCalled();
    expect(loadShopifyProduct).not.toHaveBeenCalled();
  });

  it('isolates invalid handles before resolver or adapter access', async () => {
    const getReleaseEvidence = vi.fn();
    const loadShopifyProduct = vi.fn();
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: [null, 'UPPER CASE'],
      getReleaseEvidence,
      loadShopifyProduct,
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      candidateCount: 2,
      visibleCount: 0,
      excludedCount: 2,
      products: [],
      excludedReasons: ['CATALOG_CANDIDATE_HANDLE_INVALID'],
    });
    expect(getReleaseEvidence).not.toHaveBeenCalled();
    expect(loadShopifyProduct).not.toHaveBeenCalled();
  });

  it('isolates one evidence-resolver failure while retaining another eligible candidate', async () => {
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['broken-product', 'staged-product'],
      getReleaseEvidence: (handle) => {
        if (handle === 'broken-product')
          throw new Error('sanitized resolver failure');
        return releaseEvidence('staged', handle);
      },
      loadShopifyProduct: vi.fn(async (handle) =>
        createObservedShopifyProduct(handle, 'preview')
      ),
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'available',
      candidateCount: 2,
      visibleCount: 1,
      excludedCount: 1,
      excludedReasons: ['CATALOG_CANDIDATE_RESOLUTION_FAILED'],
    });
  });

  it('isolates one adapter failure while retaining another eligible candidate', async () => {
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['broken-product', 'staged-product'],
      getReleaseEvidence: (handle) => releaseEvidence('staged', handle),
      loadShopifyProduct: vi.fn(async (handle) => {
        if (handle === 'broken-product')
          throw new Error('sanitized adapter failure');
        return createObservedShopifyProduct(handle, 'preview');
      }),
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'available',
      candidateCount: 2,
      visibleCount: 1,
      excludedCount: 1,
      excludedReasons: ['SHOPIFY_REQUEST_FAILED'],
    });
  });

  it('isolates stale and tampered observations without withholding another candidate', async () => {
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: [
        'stale-product',
        'tampered-product',
        'eligible-product',
      ],
      getReleaseEvidence: (handle) => {
        const evidence = releaseEvidence('staged', handle);
        if (handle === 'stale-product') {
          evidence.releaseRecord.shopify.commerceFactsFingerprint = `sha256:${'f'.repeat(64)}`;
        }
        return evidence;
      },
      loadShopifyProduct: vi.fn(async (handle) => {
        const product = createObservedShopifyProduct(handle, 'preview');
        if (handle === 'tampered-product') {
          product.observation.product.minimumPrice = 1;
        }
        product.name = `${handle} secret payload`;
        return product;
      }),
    });

    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'available',
      candidateCount: 3,
      visibleCount: 1,
      excludedCount: 2,
      excludedReasons: [
        'PRODUCT_COMMERCE_FACTS_STALE',
        'PRODUCT_OBSERVATION_INVALID',
      ],
    });
    expect(decision.products[0].handle).toBe('eligible-product');
    expect(JSON.stringify(decision)).not.toContain(
      'stale-product secret payload'
    );
    expect(JSON.stringify(decision)).not.toContain(
      'tampered-product secret payload'
    );
  });

  it('withholds malformed media without denying an otherwise valid product candidate', async () => {
    const decision = await getCatalogDecision({
      environment: 'preview',
      mode: 'shopify',
      candidateHandles: ['malformed-product', 'staged-product'],
      getReleaseEvidence: (handle) => releaseEvidence('staged', handle),
      loadShopifyProduct: vi.fn(async (handle) =>
        handle === 'malformed-product'
          ? {
              ...createObservedShopifyProduct(handle, 'preview'),
              name: 'Malformed denied candidate',
              media: {},
            }
          : createObservedShopifyProduct(handle, 'preview')
      ),
    });
    expectValid(decision);
    expect(decision).toMatchObject({
      status: 'available',
      candidateCount: 2,
      visibleCount: 2,
      excludedCount: 0,
      excludedReasons: [],
    });
    expect(JSON.stringify(decision)).not.toContain(
      'Malformed denied candidate'
    );
  });
});
