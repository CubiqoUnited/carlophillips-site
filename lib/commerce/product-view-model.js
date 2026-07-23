function normalizeMediaItem(item, index, title) {
  const type = item.type || 'image';
  const url = item.url || item.src || '';
  const previewUrl = item.previewUrl || item.src || item.url || '';

  return {
    id: item.id || `media-${index}`,
    type,
    url,
    previewUrl,
    alt: item.alt || title,
    label: item.label || type.replaceAll('_', ' '),
  };
}

export function toProductViewModel(decision) {
  if (!decision?.product) return null;

  const product = decision.product;
  const title = product.title || product.name || 'Untitled product';
  const colors = product.variants?.colors || (product.color ? [product.color] : []);
  const sizes = product.variants?.sizes || product.sizes || [];

  return {
    source: decision.source,
    sourceLabel: decision.source === 'shopify'
      ? 'Shopify Storefront observation — release approval pending'
      : 'Local fixture review — not Shopify live data',
    commerceAllowed: decision.commerceAllowed,
    reason: decision.reason,
    id: product.id,
    title,
    handle: product.handle || product.id,
    price: Number(product.price || 0),
    currency: product.currency || 'USD',
    description: product.description || '',
    story: product.story || 'Product story remains pending release evidence and approval.',
    colors,
    sizes,
    availableForSale: Boolean(product.availableForSale),
    vendor: product.vendor || 'Not observed',
    productType: product.productType || product.category || 'Not observed',
    media: (product.media || []).map((item, index) => normalizeMediaItem(item, index, title)),
    details: product.details || [],
  };
}
