import type { CatalogDecision, RuntimeMedia } from './runtime-types';
import type { CustomerMediaType } from '../media/types';
import type { PreviewJourneyProjection } from '../../types';
import { buildMediaViewerProjection } from '../media/viewer';

function messageFor(decision: CatalogDecision): string {
  if (decision.source === 'fixture' && decision.visibleCount > 0) {
    return `${decision.visibleCount} local non-commerce ${decision.visibleCount === 1 ? 'fixture is' : 'fixtures are'} available for review.`;
  }
  if (decision.environment === 'preview' && decision.visibleCount > 0) {
    return decision.commerceAllowed
      ? `${decision.visibleCount} reviewed ${decision.visibleCount === 1 ? 'product is' : 'products are'} active in private staging.`
      : `${decision.visibleCount} private Staged-or-later release ${decision.visibleCount === 1 ? 'candidate is' : 'candidates are'} available for review.`;
  }
  if (decision.environment === 'production' && decision.visibleCount > 0) {
    return decision.commerceAllowed
      ? `${decision.visibleCount} ${decision.visibleCount === 1 ? 'product is' : 'products are'} available.`
      : `${decision.visibleCount} Released ${decision.visibleCount === 1 ? 'product is' : 'products are'} visible. Purchasing remains disabled.`;
  }
  if (decision.status === 'denied') {
    return `The catalog release gate is closed. ${decision.excludedCount} ${decision.excludedCount === 1 ? 'candidate is' : 'candidates are'} withheld.`;
  }
  return `No release-eligible products are visible. ${decision.excludedCount} ${decision.excludedCount === 1 ? 'candidate is' : 'candidates are'} withheld.`;
}

const HOME_MEDIA_TYPES = new Set<CustomerMediaType>([
  'image',
  'video',
  'external_video',
  'model_3d',
  'spin',
]);
const HOME_MEDIA_LABELS: Record<CustomerMediaType, string> = {
  image: 'Product still',
  video: 'Product motion',
  external_video: 'Product film',
  model_3d: 'Interactive product view',
  spin: 'Customer-controlled 360°',
};
function toHomeMedia(item: RuntimeMedia, title: string) {
  const projected = buildMediaViewerProjection({
    media: [item],
    title,
  })[0];
  if (!projected || !HOME_MEDIA_TYPES.has(projected.type)) return null;
  const { src: _src, disclosure: _disclosure, ...media } = projected;
  return {
    ...media,
    label: HOME_MEDIA_LABELS[projected.type],
  };
}

export function toHomeCatalogSummary(decision: CatalogDecision) {
  const first = decision.products[0] || null;
  const media = (first?.media || [])
    .map((item) => toHomeMedia(item, first.title))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  return {
    schemaVersion: 'cp.home-catalog-summary.v1',
    environment: decision.environment,
    status: decision.status,
    candidateCount: decision.candidateCount,
    visibleCount: decision.visibleCount,
    excludedCount: decision.excludedCount,
    commerceAllowed: decision.commerceAllowed,
    message: messageFor(decision),
    primaryProduct: first
      ? (() => {
          const productMedia = media.filter(
            (item) =>
              !item.onBodyPose &&
              !item.modalities.some((modality) =>
                ['on-model', 'lifestyle'].includes(modality)
              )
          );
          return {
            handle: first.handle,
            title: first.title,
            href: `/product/${first.handle}`,
            sourceLabel: first.sourceLabel,
            commerceAllowed: first.commerceAllowed,
            description: first.description || '',
            price: first.price,
            currency: first.currency,
            tagline: first.tagline || '',
            productType: first.productType || '',
            colors: first.colors || [],
            details: first.details || [],
            sizes: first.sizes || [],
            variantPresentation: first.variantPresentation || null,
            heroMedia: productMedia[0] || null,
            media: productMedia,
          };
        })()
      : null,
  };
}

export function toPreviewJourneyProjection(
  decision: CatalogDecision
): PreviewJourneyProjection | null {
  const product = decision.products[0] || null;
  if (
    decision.environment === 'production' ||
    decision.visibleCount < 1 ||
    decision.commerceAllowed ||
    !product?.handle
  ) {
    return null;
  }

  const reviewedSizes = Array.from(
    new Set(
      (product.sizes || []).map((label) => String(label).trim()).filter(Boolean)
    )
  ).slice(0, 5);

  return {
    schemaVersion: 'cp.preview-journey.v1',
    mode: 'private-review',
    releaseBoundary: 'draft-non-commerce',
    commerceAllowed: false,
    productHandle: product.handle,
    productName: product.title,
    colorLabel: product.colors?.[0] || 'Color withheld',
    priceLabel: 'Price withheld during private review',
    choices: reviewedSizes.map((label, index) => ({
      id: `review-choice-${index + 1}`,
      label,
    })),
  };
}
