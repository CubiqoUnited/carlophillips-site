import { describe, expect, it } from 'vitest';
import {
  fingerprintStorefrontMedia,
  filterReleaseBoundMedia,
} from '../lib/commerce/media-visibility-policy.js';
import { resolveProductSource } from '../lib/commerce/release-policy.js';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
  createObservedShopifyProduct,
} from './fixtures/release-fixtures.js';

function observedMedia(assetId, type = 'image') {
  return {
    id: `shopify-media:${assetId}`,
    type,
    url: `https://cdn.example/${assetId}`,
    previewUrl: `https://cdn.example/${assetId}-preview`,
    alt: `Unreviewed ${assetId}`,
  };
}

describe('release-bound storefront media', () => {
  it('renders only approved exact bindings and replaces raw IDs and alt text', () => {
    const manifest = createCompleteMediaManifest();
    const product = {
      media: [
        observedMedia('front-image'),
        observedMedia('film-asset', 'video'),
        observedMedia('rogue-unapproved-media'),
      ],
    };
    const decision = filterReleaseBoundMedia({ product, manifest });

    expect(decision).toMatchObject({
      includedCount: 2,
      excludedCount: 1,
    });
    expect(decision.product.media.map(item => item.id)).toEqual([
      'front-image',
      'film-asset',
    ]);
    expect(decision.product.media[0].alt).toBe('Exact product front-image');
    expect(decision.product.media[0].label).toBe('front');
    expect(JSON.stringify(decision.product)).not.toContain('shopify-media:');
    expect(JSON.stringify(decision.product)).not.toContain('rogue-unapproved-media');
  });

  it('renders the approved required set and approved fallbacks as production-complete', () => {
    const product = createObservedShopifyProduct('test-product', 'production');
    const decision = filterReleaseBoundMedia({
      product,
      manifest: createCompleteMediaManifest(),
    });

    expect(decision.productionReady).toBe(true);
    expect(decision.missingModalities).toEqual([]);
    expect(decision.missingFallbackAssetIds).toEqual([]);
    expect(decision.coveredModalities).toHaveLength(9);
    expect(decision.product.media.map(item => item.id)).toEqual([
      'front-image',
      'back-angle-image',
      'embroidery-detail-image',
      'material-detail-image',
      'on-model-image',
      'lifestyle-image',
      'model-asset',
      'film-asset',
    ]);
  });

  it.each([
    ['missing binding', asset => { asset.storefrontBinding = null; }],
    ['pending approval', asset => { asset.approvalStatus = 'pending'; }],
    ['unverified rights', asset => { asset.rightsStatus = 'pending'; }],
    ['unverified product match', asset => { asset.exactProductMatch = 'unverified'; }],
    ['unverified quality', asset => { asset.quality = { status: 'pending', evidence: null }; }],
  ])('withholds an asset with %s', (_label, mutate) => {
    const manifest = createCompleteMediaManifest();
    mutate(manifest.assets.find(asset => asset.assetId === 'front-image'));
    const decision = filterReleaseBoundMedia({
      product: { media: [observedMedia('front-image')] },
      manifest,
    });

    expect(decision.product.media).toEqual([]);
    expect(decision).toMatchObject({ includedCount: 0, excludedCount: 1 });
  });

  it('withholds duplicate storefront bindings and kind mismatches', () => {
    const manifest = createCompleteMediaManifest();
    const front = manifest.assets.find(asset => asset.assetId === 'front-image');
    const back = manifest.assets.find(asset => asset.assetId === 'back-angle-image');
    back.storefrontBinding = structuredClone(front.storefrontBinding);

    const duplicate = filterReleaseBoundMedia({
      product: { media: [observedMedia('front-image')] },
      manifest,
    });
    expect(duplicate.product.media).toEqual([]);

    back.storefrontBinding.referenceHash = fingerprintStorefrontMedia(
      observedMedia('back-angle-image')
    );
    const wrongKind = filterReleaseBoundMedia({
      product: { media: [observedMedia('front-image', 'video')] },
      manifest,
    });
    expect(wrongKind.product.media).toEqual([]);

    const wrongModality = createCompleteMediaManifest();
    wrongModality.requirements.find(item => item.modality === 'front').assetIds = ['film-asset'];
    wrongModality.requirements.find(item => item.modality === 'video').assetIds = [];
    expect(filterReleaseBoundMedia({
      product: { media: [observedMedia('film-asset', 'video')] },
      manifest: wrongModality,
    }).product.media).toEqual([]);

    const duplicateAsset = createCompleteMediaManifest();
    duplicateAsset.assets.push(structuredClone(
      duplicateAsset.assets.find(item => item.assetId === 'front-image')
    ));
    expect(filterReleaseBoundMedia({
      product: { media: [observedMedia('front-image')] },
      manifest: duplicateAsset,
    }).product.media).toEqual([]);
  });

  it('withholds a stale URL even when the Shopify media ID is unchanged', () => {
    const manifest = createCompleteMediaManifest();
    const changed = observedMedia('front-image');
    changed.url = 'https://cdn.example/front-image-replaced';

    const decision = filterReleaseBoundMedia({
      product: { media: [changed] },
      manifest,
    });
    expect(decision.product.media).toEqual([]);
    expect(decision.excludedCount).toBe(1);
  });

  it('canonicalizes safe URL query order and rejects non-HTTPS media', () => {
    const manifest = createCompleteMediaManifest();
    const front = manifest.assets.find(asset => asset.assetId === 'front-image');
    const bound = observedMedia('front-image');
    bound.url = 'https://cdn.example/front-image?width=1200&format=webp';
    front.storefrontBinding.referenceHash = fingerprintStorefrontMedia(bound);

    const reordered = observedMedia('front-image');
    reordered.url = 'https://cdn.example/front-image?format=webp&width=1200';
    expect(filterReleaseBoundMedia({
      product: { media: [reordered] },
      manifest,
    }).product.media).toHaveLength(1);

    const unsafe = observedMedia('front-image');
    unsafe.url = 'http://cdn.example/front-image';
    expect(filterReleaseBoundMedia({
      product: { media: [unsafe] },
      manifest: createCompleteMediaManifest(),
    }).product.media).toEqual([]);
  });

  it('filters the active release decision before a Shopify payload reaches the view model', () => {
    const shopifyProduct = createObservedShopifyProduct('test-product', 'preview');
    shopifyProduct.media = [
      observedMedia('front-image'),
      observedMedia('unapproved-detail'),
    ];
    const decision = resolveProductSource({
      environment: 'preview',
      shopifyProduct,
      releaseRecord: createCompleteReleaseRecord('staged'),
      mediaManifest: createCompleteMediaManifest(),
    });

    expect(decision.visibilityAllowed).toBe(true);
    expect(decision.commerceAllowed).toBe(false);
    expect(decision.reason).toBe('PRIVATE_RELEASE_REVIEW_NON_COMMERCE');
    expect(decision.product.media).toHaveLength(1);
    expect(decision.product.media[0].id).toBe('front-image');
    expect(JSON.stringify(decision)).not.toContain('unapproved-detail');
    expect(JSON.stringify(decision)).not.toContain('shopify-media:');
  });

  it('strips an unapproved extra without failing an otherwise complete Released set', () => {
    const shopifyProduct = createObservedShopifyProduct('test-product', 'production');
    shopifyProduct.media.push(observedMedia('unapproved-extra'));
    const decision = resolveProductSource({
      environment: 'production',
      shopifyProduct,
      releaseRecord: createCompleteReleaseRecord('released'),
      mediaManifest: createCompleteMediaManifest(),
    });

    expect(decision.visibilityAllowed).toBe(true);
    expect(decision.commerceAllowed).toBe(false);
    expect(decision.product.media).toHaveLength(8);
    expect(JSON.stringify(decision)).not.toContain('unapproved-extra');
  });

  it('denies production when a required current binding is missing or stale', () => {
    for (const mutate of [
      product => {
        product.media = product.media.filter(item => item.id !== 'shopify-media:front-image');
      },
      product => {
        product.media.find(item => item.id === 'shopify-media:film-asset').url =
          'https://cdn.example/film-asset-replaced';
      },
    ]) {
      const shopifyProduct = createObservedShopifyProduct('test-product', 'production');
      mutate(shopifyProduct);
      const decision = resolveProductSource({
        environment: 'production',
        shopifyProduct,
        releaseRecord: createCompleteReleaseRecord('released'),
        mediaManifest: createCompleteMediaManifest(),
      });

      expect(decision).toMatchObject({
        status: 'denied',
        visibilityAllowed: false,
        commerceAllowed: false,
        reason: 'PRODUCT_RELEASE_MEDIA_BINDING_INCOMPLETE',
        product: null,
      });
    }
  });

  it('keeps a private Staged product visible but media-empty when assets are candidates', () => {
    const manifest = createCompleteMediaManifest();
    const frontRequirement = manifest.requirements.find(item => item.modality === 'front');
    frontRequirement.status = 'candidate';
    const frontAsset = manifest.assets.find(item => item.assetId === 'front-image');
    frontAsset.approvalStatus = 'pending';
    const shopifyProduct = createObservedShopifyProduct('test-product', 'preview');
    shopifyProduct.media = [observedMedia('front-image')];

    const decision = resolveProductSource({
      environment: 'preview',
      shopifyProduct,
      releaseRecord: createCompleteReleaseRecord('staged'),
      mediaManifest: manifest,
    });

    expect(decision.visibilityAllowed).toBe(true);
    expect(decision.commerceAllowed).toBe(false);
    expect(decision.reason).toBe('PRIVATE_RELEASE_REVIEW_NON_COMMERCE');
    expect(decision.product.media).toEqual([]);
    expect(decision.product.heroImage).toBe('');
  });
});
