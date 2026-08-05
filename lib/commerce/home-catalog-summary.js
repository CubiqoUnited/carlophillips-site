function messageFor(decision) {
  if (decision.source === 'fixture' && decision.visibleCount > 0) {
    return `${decision.visibleCount} local non-commerce ${decision.visibleCount === 1 ? 'fixture is' : 'fixtures are'} available for review.`;
  }
  if (decision.environment === 'preview' && decision.visibleCount > 0) {
    return `${decision.visibleCount} private Staged-or-later release ${decision.visibleCount === 1 ? 'candidate is' : 'candidates are'} available for review.`;
  }
  if (decision.environment === 'production' && decision.visibleCount > 0) {
    return `${decision.visibleCount} Released ${decision.visibleCount === 1 ? 'product is' : 'products are'} visible. Purchasing remains disabled.`;
  }
  if (decision.status === 'denied') {
    return `The catalog release gate is closed. ${decision.excludedCount} ${decision.excludedCount === 1 ? 'candidate is' : 'candidates are'} withheld.`;
  }
  return `No release-eligible products are visible. ${decision.excludedCount} ${decision.excludedCount === 1 ? 'candidate is' : 'candidates are'} withheld.`;
}

export function toHomeCatalogSummary(decision) {
  const first = decision.products[0] || null;
  const heroMedia = first?.media?.find(item => item?.url && item?.type === 'image') || null;
  return {
    schemaVersion: 'cp.home-catalog-summary.v1',
    environment: decision.environment,
    status: decision.status,
    candidateCount: decision.candidateCount,
    visibleCount: decision.visibleCount,
    excludedCount: decision.excludedCount,
    commerceAllowed: false,
    message: messageFor(decision),
    primaryProduct: first ? {
      title: first.title,
      href: `/products/${first.handle}`,
      sourceLabel: first.sourceLabel,
      commerceAllowed: false,
      heroMedia: heroMedia ? {
        url: heroMedia.url,
        alt: heroMedia.alt || first.title,
        label: heroMedia.label || 'Release-bound product media',
      } : null,
    } : null,
  };
}
