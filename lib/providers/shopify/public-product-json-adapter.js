import { normalizeProduct } from '../../shopify/normalize.js';

const PRODUCT_ID_PATTERN = /^[1-9][0-9]*$/;

function moneyFromCents(value) {
  if (!Number.isInteger(value) || value < 0) throw new Error('Shopify public product price is invalid.');
  return (value / 100).toFixed(2);
}

function plainDescription(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizePublicShopifyProduct(payload, { currency = 'USD' } = {}) {
  if (!PRODUCT_ID_PATTERN.test(String(payload?.id || ''))) throw new Error('Shopify public product identity is invalid.');
  if (!payload?.handle || !payload?.title || !Array.isArray(payload?.variants) || payload.variants.length === 0) {
    throw new Error('Shopify public product facts are incomplete.');
  }
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Shopify public product currency is invalid.');

  const optionNames = Array.isArray(payload.options) ? payload.options.map(option => option.name) : [];
  const variants = payload.variants.map(variant => {
    if (!PRODUCT_ID_PATTERN.test(String(variant?.id || ''))) throw new Error('Shopify public variant identity is invalid.');
    const optionValues = [variant.option1, variant.option2, variant.option3];
    return {
      id: `gid://shopify/ProductVariant/${variant.id}`,
      title: String(variant.title || ''),
      availableForSale: variant.available === true,
      price: { amount: moneyFromCents(variant.price), currencyCode: currency },
      selectedOptions: optionNames.map((name, index) => ({
        name,
        value: String(optionValues[index] || ''),
      })).filter(option => option.value),
    };
  });

  const images = (payload.images || []).map(image => ({
    node: {
      url: typeof image === 'string' ? image : image?.src,
      altText: payload.title,
      width: typeof image === 'object' ? image.width || null : null,
      height: typeof image === 'object' ? image.height || null : null,
    },
  })).filter(edge => edge.node.url);
  const media = (Array.isArray(payload.media) ? payload.media : []).map(item => {
    const id = String(item?.id || '');
    const type = String(item?.media_type || '').toLowerCase();
    const resource = type === 'video'
      ? 'Video'
      : type === 'external_video'
        ? 'ExternalVideo'
        : type === 'model_3d'
          ? 'Model3d'
          : 'MediaImage';
    if (!PRODUCT_ID_PATTERN.test(id) || !type) return null;
    const previewUrl = item?.preview_image?.src || item?.src || '';
    return {
      node: {
        id: `gid://shopify/${resource}/${id}`,
        mediaContentType: type.toUpperCase(),
        alt: item?.alt || payload.title,
        previewImage: {
          url: previewUrl,
          altText: item?.alt || payload.title,
          width: item?.preview_image?.width || null,
          height: item?.preview_image?.height || null,
        },
        ...(type === 'image'
          ? { image: { url: item?.src || previewUrl, width: item?.width || null, height: item?.height || null } }
          : {}),
      },
    };
  }).filter(edge => edge?.node?.previewImage?.url || edge?.node?.image?.url);

  return normalizeProduct({
    id: `gid://shopify/Product/${payload.id}`,
    handle: payload.handle,
    title: payload.title,
    description: plainDescription(payload.description),
    descriptionHtml: String(payload.description || ''),
    vendor: String(payload.vendor || ''),
    productType: String(payload.type || ''),
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    priceRange: {
      minVariantPrice: { amount: moneyFromCents(payload.price_min), currencyCode: currency },
      maxVariantPrice: { amount: moneyFromCents(payload.price_max), currencyCode: currency },
    },
    images: { edges: images },
    media: { edges: media },
    variants: { edges: variants.map(node => ({ node })) },
  });
}
