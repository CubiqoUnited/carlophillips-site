/**
 * Pure Shopify response normalization.
 *
 * This module contains no transport, credentials, or mutations. Server
 * adapters and deterministic tests can share it without exposing the
 * Storefront client to browser bundles.
 */

export function normalizeProduct(shopifyProduct) {
  if (!shopifyProduct) return null;

  try {
    const images = shopifyProduct.images?.edges?.map(edge => edge.node.url) || [];
    const media = normalizeProductMedia(shopifyProduct);
    const variants = shopifyProduct.variants?.edges?.map(edge => edge.node) || [];
    const tags = shopifyProduct.tags || [];
    const colors = [...new Set(variants
      .flatMap(variant => variant.selectedOptions || [])
      .filter(option => option.name?.toLowerCase() === 'color')
      .map(option => option.value))];
    const sizes = [...new Set(variants
      .flatMap(variant => variant.selectedOptions || [])
      .filter(option => option.name?.toLowerCase() === 'size')
      .map(option => option.value))];
    const shopifyVariants = {};

    variants.forEach(variant => {
      const color = variant.selectedOptions?.find(option => option.name?.toLowerCase() === 'color')?.value || 'Default';
      const size = variant.selectedOptions?.find(option => option.name?.toLowerCase() === 'size')?.value || 'One Size';
      shopifyVariants[`${color}-${size}`] = variant.id;
    });

    return {
      id: shopifyProduct.handle,
      handle: shopifyProduct.handle,
      shopifyId: shopifyProduct.id,
      name: shopifyProduct.title,
      collection: shopifyProduct.productType?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
      price: parseFloat(shopifyProduct.priceRange?.minVariantPrice?.amount || 0),
      compareAtPrice: parseFloat(shopifyProduct.priceRange?.maxVariantPrice?.amount || 0),
      currency: shopifyProduct.priceRange?.minVariantPrice?.currencyCode || 'USD',
      tagline: getCustomerFacingTagline(tags, shopifyProduct.productType),
      description: shopifyProduct.description || '',
      descriptionHtml: shopifyProduct.descriptionHtml || '',
      details: shopifyProduct.description?.split('\\n').filter(Boolean) || [],
      images,
      media,
      heroImage: media.find(item => item.previewUrl)?.previewUrl || images[0] || '',
      variants: {
        colors: colors.length > 0 ? colors : ['Default'],
        sizes: sizes.length > 0 ? sizes : ['One Size'],
      },
      shopifyVariants,
      firstVariantId: variants[0]?.id || null,
      availableForSale: variants.some(variant => variant.availableForSale),
      vendor: shopifyProduct.vendor || '',
      productType: shopifyProduct.productType || '',
      tags,
    };
  } catch (error) {
    console.error('Error normalizing product:', error);
    return null;
  }
}

function getCustomerFacingTagline(tags = [], productType = '') {
  const blockedTerms = [
    'apliiq',
    'printful',
    'printify',
    'supplier',
    'lane',
    'qa',
    'review',
    'candidate',
    'drop-',
  ];
  const displayTag = tags.find(tag => {
    const normalized = tag.toLowerCase();
    return !blockedTerms.some(term => normalized.includes(term));
  });

  return (displayTag || productType || '').toUpperCase();
}

function normalizeProductMedia(shopifyProduct) {
  const mediaEdges = shopifyProduct.media?.edges || [];

  if (mediaEdges.length > 0) {
    return mediaEdges
      .map(edge => {
        const node = edge.node;
        const preview = node.previewImage || node.image || {};
        const base = {
          id: node.id,
          type: node.mediaContentType?.toLowerCase() || 'image',
          alt: node.alt || preview.altText || shopifyProduct.title,
          previewUrl: preview.url || '',
          width: preview.width || node.image?.width || null,
          height: preview.height || node.image?.height || null,
        };

        if (node.mediaContentType === 'IMAGE') {
          return { ...base, type: 'image', url: node.image?.url || preview.url || '' };
        }
        if (node.mediaContentType === 'VIDEO') {
          const sources = node.sources || [];
          const source = sources.find(item => item.mimeType === 'video/mp4') || sources[0];
          return { ...base, type: 'video', url: source?.url || '', sources };
        }
        if (node.mediaContentType === 'EXTERNAL_VIDEO') {
          return {
            ...base,
            type: 'external_video',
            url: node.embeddedUrl || node.originUrl || '',
            originUrl: node.originUrl || '',
            host: node.host || '',
          };
        }
        if (node.mediaContentType === 'MODEL_3D') {
          const sources = node.sources || [];
          const source = sources.find(item => item.mimeType === 'model/gltf-binary') || sources[0];
          return { ...base, type: 'model_3d', url: source?.url || '', sources };
        }

        return base;
      })
      .filter(item => item.url || item.previewUrl);
  }

  return (shopifyProduct.images?.edges || [])
    .map(edge => edge.node)
    .filter(Boolean)
    .map((image, index) => ({
      id: `${shopifyProduct.id || shopifyProduct.handle}-image-${index}`,
      type: 'image',
      url: image.url,
      previewUrl: image.url,
      alt: image.altText || shopifyProduct.title,
      width: image.width || null,
      height: image.height || null,
    }));
}

export function normalizeCollection(shopifyCollection) {
  if (!shopifyCollection) return null;

  return {
    id: shopifyCollection.handle,
    shopifyId: shopifyCollection.id,
    name: shopifyCollection.title,
    description: shopifyCollection.description || '',
    image: shopifyCollection.image?.url || '',
    featured: true,
  };
}

export function normalizeCart(shopifyCart) {
  if (!shopifyCart) {
    return { id: null, items: [], total: 0, checkoutUrl: '', totalQuantity: 0 };
  }

  try {
    const items = shopifyCart.lines?.edges?.map(edge => {
      const line = edge.node;
      const merchandise = line.merchandise;
      const color = merchandise.selectedOptions?.find(option => option.name?.toLowerCase() === 'color')?.value || 'Default';
      const size = merchandise.selectedOptions?.find(option => option.name?.toLowerCase() === 'size')?.value || 'One Size';

      return {
        key: `${merchandise.product?.handle || 'product'}-${color}-${size}`,
        lineItemId: line.id,
        productId: merchandise.product?.handle || '',
        variantId: merchandise.id,
        name: merchandise.product?.title || 'Product',
        price: parseFloat(merchandise.price?.amount || 0),
        image: merchandise.image?.url || '',
        color,
        size,
        quantity: line.quantity,
      };
    }) || [];

    return {
      id: shopifyCart.id,
      items,
      total: parseFloat(shopifyCart.cost?.totalAmount?.amount || 0),
      subtotal: parseFloat(shopifyCart.cost?.subtotalAmount?.amount || 0),
      checkoutUrl: shopifyCart.checkoutUrl || '',
      totalQuantity: shopifyCart.totalQuantity || 0,
    };
  } catch (error) {
    console.error('Error normalizing cart:', error);
    return { id: null, items: [], total: 0, checkoutUrl: '', totalQuantity: 0 };
  }
}
