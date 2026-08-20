import { buildMediaViewerProjection } from '../media/viewer';
import type { ReleaseBoundMediaItem } from '../media/types';
import type {
  ProductViewModel,
  ReleaseDecision,
  RuntimeMedia,
} from './runtime-types';

function normalizeMediaItem(
  item: RuntimeMedia,
  index: number,
  title: string
): Partial<ReleaseBoundMediaItem> {
  const type = item.type || 'image';
  const url = item.url || item.src || '';
  const previewUrl = item.previewUrl || item.src || item.url || '';

  return {
    ...item,
    id: item.id || `media-${index}`,
    type,
    url,
    previewUrl,
    alt: item.alt || title,
    label: item.label || type.replaceAll('_', ' '),
  } as Partial<ReleaseBoundMediaItem>;
}

function releasePresentation(decision: ReleaseDecision) {
  if (decision.source === 'fixture') {
    return {
      sourceLabel: 'Local presentation fixture — not live store data',
      truthHeading: 'Local fixture facts, not a release.',
      story: 'No reviewed product story is available for this local fixture.',
      commerceExplanation:
        'This fixture is for local presentation review only. Purchasing is disabled.',
    };
  }
  if (
    decision.source === 'shopify' &&
    decision.environment === 'production' &&
    decision.reason === 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED'
  ) {
    return {
      sourceLabel: 'Released product facts',
      truthHeading: 'Reviewed facts, released product.',
      story: 'No reviewed product story is available.',
      commerceExplanation:
        'Product facts are released. Purchasing remains disabled until the separate cart and checkout gates are proven.',
    };
  }
  if (decision.source === 'shopify' && decision.environment === 'preview') {
    return {
      sourceLabel: 'Private product review',
      truthHeading: 'Reviewed facts, private release review.',
      story: 'No reviewed product story is available.',
      commerceExplanation:
        'This is a private release review. Purchasing remains disabled until the separate release and commerce gates pass.',
    };
  }
  if (decision.source === 'shopify' && decision.environment === 'local') {
    return {
      sourceLabel: 'Local product review',
      truthHeading: 'Observed facts, local review.',
      story: 'No reviewed product story is available.',
      commerceExplanation:
        'This is a local observation review. Purchasing remains disabled.',
    };
  }
  return {
    sourceLabel: 'Commerce source — release state unavailable',
    truthHeading: 'Release state unavailable.',
    story: 'No reviewed product story is available.',
    commerceExplanation:
      'Purchasing remains disabled because the release context is unavailable.',
  };
}

export function toProductViewModel(
  decision: ReleaseDecision
): ProductViewModel | null {
  if (!decision?.product) return null;

  const product = decision.product;
  const presentation = releasePresentation(decision);
  const title = product.title || product.name || 'Untitled product';
  const localColors =
    product.variants?.colors ||
    (typeof product.color === 'string' ? [product.color] : []);
  const localSizes = product.variants?.sizes || product.sizes || [];

  const media = (product.media || []).map((item, index) =>
    normalizeMediaItem(item, index, title)
  );

  return {
    source: decision.source,
    sourceLabel: presentation.sourceLabel,
    commerceAllowed: decision.commerceAllowed,
    reason: decision.reason,
    id: product.id,
    title,
    handle: product.handle || product.id,
    price: Number(product.price || 0),
    currency: product.currency || 'USD',
    description: product.description || '',
    tagline: product.tagline || '',
    story: presentation.story,
    truthHeading: presentation.truthHeading,
    commerceExplanation: presentation.commerceExplanation,
    colors: decision.source === 'fixture' ? localColors : [],
    sizes: decision.source === 'fixture' ? localSizes : [],
    variantPresentation:
      decision.source === 'shopify'
        ? product.variantPresentation || null
        // Synthetic staging variants so S/M/L size chooser renders during fixture/preview review.
        // Reference hashes match shopify-product-offer.json allowedReferenceHashes.
        : (decision.source === 'fixture' || decision.environment === 'preview' || decision.environment === 'local')
          ? {
              combinations: [
                {
                  referenceHash: 'sha256:0938f4582f512244658066942f269c16cca1efdec1e197868c05cfdb8fa5859d',
                  availableForSale: true,
                  title: 'S',
                  selectedOptions: [{ name: 'Size', value: 'S' }],
                  price: { amount: String(product.price || 128), currency: product.currency || 'USD' },
                },
                {
                  referenceHash: 'sha256:a9e7278b69f56390e767c748682c37970a58b5abf9e4c47b612bebcb67cdf9c3',
                  availableForSale: true,
                  title: 'M',
                  selectedOptions: [{ name: 'Size', value: 'M' }],
                  price: { amount: String(product.price || 128), currency: product.currency || 'USD' },
                },
                {
                  referenceHash: 'sha256:bca824ce1a2583241b1785b1b655d7dd161c0dc18cdb56f05c528b2d2905e581',
                  availableForSale: true,
                  title: 'L',
                  selectedOptions: [{ name: 'Size', value: 'L' }],
                  price: { amount: String(product.price || 128), currency: product.currency || 'USD' },
                },
              ],
            } as any
          : null,
    availableForSale: Boolean(product.availableForSale),
    vendor: product.vendor || 'Not observed',
    productType: product.productType || product.category || 'Not observed',
    media:
      decision.source === 'fixture'
        ? media.map((item, index) => ({
            ...item,
            id: item.id || item.registryAssetId || `fixture-media-${index}`,
            registryAssetId:
              item.registryAssetId || item.id || `fixture-media-${index}`,
            src: item.url || item.previewUrl || '',
            disclosure: 'Release-bound product view' as const,
          }))
        : buildMediaViewerProjection({ media, title }),
    mediaReview: product.mediaReview || null,
    details: product.details || [],
    variantFingerprint: product.variantFingerprint,
    commerceFactsFingerprint: product.commerceFactsFingerprint,
    observationFingerprint: product.observationFingerprint,
  };
}
