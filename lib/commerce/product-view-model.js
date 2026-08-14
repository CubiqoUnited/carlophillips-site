import { toProviderNeutralMediaAlt } from './media-presentation.js';

function normalizeMediaItem(item, index, title) {
  const type = item.type || 'image';
  const url = item.url || item.src || '';
  const previewUrl = item.previewUrl || item.src || item.url || '';

  return {
    id: item.id || `media-${index}`,
    type,
    url,
    previewUrl,
    alt: toProviderNeutralMediaAlt(item.alt, title),
    label: item.label || type.replaceAll('_', ' '),
  };
}

function releasePresentation(decision) {
  if (decision.source === 'fixture') {
    return {
      sourceLabel: 'Local presentation fixture — not live store data',
      truthHeading: 'Local fixture facts, not a release.',
      story: 'No reviewed product story is available for this local fixture.',
      commerceExplanation: 'This fixture is for local presentation review only. Purchasing is disabled.',
    };
  }
  if (
    decision.source === 'shopify'
    && decision.environment === 'production'
    && decision.reason === 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED'
  ) {
    return {
      sourceLabel: 'Released product facts',
      truthHeading: 'Reviewed facts, released product.',
      story: 'No reviewed product story is available.',
      commerceExplanation: 'Product facts are released. Purchasing remains disabled until the separate cart and checkout gates are proven.',
    };
  }
  if (decision.source === 'shopify' && decision.environment === 'preview') {
    return {
      sourceLabel: 'Private product review',
      truthHeading: 'Reviewed facts, private release review.',
      story: 'No reviewed product story is available.',
      commerceExplanation: 'This is a private release review. Purchasing remains disabled until the separate release and commerce gates pass.',
    };
  }
  if (decision.source === 'shopify' && decision.environment === 'local') {
    return {
      sourceLabel: 'Local product review',
      truthHeading: 'Observed facts, local review.',
      story: 'No reviewed product story is available.',
      commerceExplanation: 'This is a local observation review. Purchasing remains disabled.',
    };
  }
  return {
    sourceLabel: 'Commerce source — release state unavailable',
    truthHeading: 'Release state unavailable.',
    story: 'No reviewed product story is available.',
    commerceExplanation: 'Purchasing remains disabled because the release context is unavailable.',
  };
}

export function toProductViewModel(decision) {
  if (!decision?.product) return null;

  const product = decision.product;
  const presentation = releasePresentation(decision);
  const title = product.title || product.name || 'Untitled product';
  const localColors = product.variants?.colors || (product.color ? [product.color] : []);
  const localSizes = product.variants?.sizes || product.sizes || [];

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
    variantPresentation: decision.source === 'shopify'
      ? product.variantPresentation || null
      : null,
    availableForSale: Boolean(product.availableForSale),
    vendor: product.vendor || 'Not observed',
    productType: product.productType || product.category || 'Not observed',
    media: (product.media || []).map((item, index) => normalizeMediaItem(item, index, title)),
    mediaReview: product.mediaReview || null,
    details: product.details || [],
  };
}
