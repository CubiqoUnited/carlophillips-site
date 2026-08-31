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
  if (decision.source === 'shopify') {
    return {
      sourceLabel: 'Shopify',
      truthHeading: 'Current product information.',
      story: decision.product?.description || '',
      commerceExplanation:
        'Current price, variants, and availability are supplied by Shopify.',
    };
  }
  return {
    sourceLabel: 'Product unavailable',
    truthHeading: 'Product information unavailable.',
    story: '',
    commerceExplanation: 'This product is currently unavailable.',
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
      decision.source === 'shopify' && product.variantPresentation
        ? product.variantPresentation
        : null,
    availableForSale: Boolean(product.availableForSale),
    vendor: product.vendor || 'Not observed',
    productType: product.productType || product.category || 'Not observed',
    media:
      decision.source === 'fixture'
        ? (media.map((item, index) => ({
            ...item,
            id: item.id || item.registryAssetId || `fixture-media-${index}`,
            registryAssetId:
              item.registryAssetId || item.id || `fixture-media-${index}`,
            src: item.url || item.previewUrl || '',
            disclosure: 'Release-bound product view' as const,
          })) as any)
        : buildMediaViewerProjection({ media, title }),
    mediaReview: product.mediaReview || null,
    details: product.details || [],
    variantFingerprint: product.variantFingerprint,
    commerceFactsFingerprint: product.commerceFactsFingerprint,
    observationFingerprint: product.observationFingerprint,
  };
}
