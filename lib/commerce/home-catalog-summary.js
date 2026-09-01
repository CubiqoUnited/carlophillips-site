import { toProviderNeutralMediaAlt } from './media-presentation.js';

function messageFor(decision) {
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

const HOME_MEDIA_TYPES = new Set(['image', 'video', 'external_video', 'model_3d']);
const HOME_MEDIA_LABELS = {
  image: 'Product still',
  video: 'Product motion',
  external_video: 'Product film',
  model_3d: 'Interactive product view',
};
function toHomeMedia(item, title) {
  if (!item?.url || !HOME_MEDIA_TYPES.has(item.type)) return null;
  return {
    type: item.type,
    url: item.url,
    previewUrl: item.previewUrl || item.url,
    alt: toProviderNeutralMediaAlt(item.alt, title),
    label: HOME_MEDIA_LABELS[item.type],
  };
}

export function toHomeCatalogSummary(decision) {
  const first = decision.products[0] || null;
  const media = (first?.media || [])
    .map(item => toHomeMedia(item, first.title))
    .filter(Boolean);
  const heroCandidate = media.find(item => item.type === 'image') || null;
  const heroMedia = heroCandidate ? {
    url: heroCandidate.url,
    alt: heroCandidate.alt,
    label: heroCandidate.label,
  } : null;
  return {
    schemaVersion: 'cp.home-catalog-summary.v1',
    environment: decision.environment,
    status: decision.status,
    candidateCount: decision.candidateCount,
    visibleCount: decision.visibleCount,
    excludedCount: decision.excludedCount,
    commerceAllowed: decision.commerceAllowed,
    message: messageFor(decision),
    primaryProduct: first ? {
      handle: first.handle,
      title: first.title,
      href: `/products/${first.handle}`,
      sourceLabel: first.sourceLabel,
      commerceAllowed: first.commerceAllowed,
      description: first.description || '',
      price: first.price,
      currency: first.currency,
      variantPresentation: first.variantPresentation || null,
      heroMedia,
      media,
    } : null,
  };
}
