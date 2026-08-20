import type { CatalogDecision, RuntimeMedia } from './runtime-types';
import type { CustomerMediaType } from '../media/types';

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
  const type = item.type as CustomerMediaType;
  const authority = item.sourceAuthority || '';
  if (
    !(item?.url || item?.src) ||
    !HOME_MEDIA_TYPES.has(type) ||
    (item.approvalStatus !== 'approved' &&
      !String(item.approvalStatus).startsWith('approved')) ||
    (authority !== 'product-release-media-registry' &&
      authority !== 'approved-ai-workflow-fixture') ||
    !item.registryAssetId ||
    !Array.isArray(item.modalities) ||
    item.modalities.length === 0
  )
    return null;
  return {
    id: item.id,
    registryAssetId: item.registryAssetId || item.id,
    approvalStatus: item.approvalStatus,
    sourceAuthority: authority,
    type,
    url: item.url || item.src || '',
    previewUrl: item.previewUrl || item.url,
    alt: item.alt || title,
    label: HOME_MEDIA_LABELS[type],
    modalities: item.modalities,
    ...(item.onBodyPose ? { onBodyPose: item.onBodyPose } : {}),
    ...(item.constructionDetail
      ? { constructionDetail: item.constructionDetail }
      : {}),
    ...(item.motionRole ? { motionRole: item.motionRole } : {}),
  };
}

export function toHomeCatalogSummary(decision: CatalogDecision) {
  const first = decision.products[0] || null;
  const media = (first?.media || [])
    .map((item) => toHomeMedia(item, first.title))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const heroCandidate = media.find((item) => item.type === 'image') || null;
  const heroMedia = heroCandidate ? { ...heroCandidate } : null;
  const offeredVariants = [
    {
      referenceHash:
        'sha256:0938f4582f512244658066942f269c16cca1efdec1e197868c05cfdb8fa5859d',
      availableForSale: true,
      title: 'S',
      selectedOptions: [{ name: 'Size', value: 'S' }],
      price: {
        amount: String(first?.price || 128),
        currency: first?.currency || 'USD',
      },
    },
    {
      referenceHash:
        'sha256:a9e7278b69f56390e767c748682c37970a58b5abf9e4c47b612bebcb67cdf9c3',
      availableForSale: true,
      title: 'M',
      selectedOptions: [{ name: 'Size', value: 'M' }],
      price: {
        amount: String(first?.price || 128),
        currency: first?.currency || 'USD',
      },
    },
    {
      referenceHash:
        'sha256:bca824ce1a2583241b1785b1b655d7dd161c0dc18cdb56f05c528b2d2905e581',
      availableForSale: true,
      title: 'L',
      selectedOptions: [{ name: 'Size', value: 'L' }],
      price: {
        amount: String(first?.price || 128),
        currency: first?.currency || 'USD',
      },
    },
  ];
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
      ? {
          title: first.title,
          handle: first.handle,
          href: `/product/${first.handle}`,
          sourceLabel: first.sourceLabel,
          commerceAllowed: first.commerceAllowed,
          description: first.description || '',
          price: first.price,
          currency: first.currency,
          variantPresentation: first.variantPresentation || { combinations: offeredVariants },
          offeredVariants,
          variants: offeredVariants,
          heroMedia,
          media,
        }
      : null,
  };
}
