import type { RuntimeProduct } from '../../commerce/runtime-types';

const PRODUCT_ID_PATTERN = /^[1-9][0-9]*$/;

interface PublicVariant {
  id?: string | number;
  title?: string;
  available?: boolean;
  price?: number;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
}

interface PublicProduct {
  id?: string | number;
  handle?: string;
  title?: string;
  description?: string;
  vendor?: string;
  type?: string;
  tags?: string[];
  price_min?: number;
  price_max?: number;
  options?: Array<{ name?: string }>;
  images?: Array<string | { src?: string }>;
  variants?: PublicVariant[];
}

function moneyFromCents(value: unknown): string {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error('Shopify public product price is invalid.');
  }
  return (Number(value) / 100).toFixed(2);
}

function plainDescription(value: unknown): string {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function customerTagline(tags: string[], productType: string): string {
  const blocked = [
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
  const tag = tags.find(
    (value) => !blocked.some((term) => value.toLowerCase().includes(term))
  );
  return (tag || productType).toUpperCase();
}

function safeImageUrl(value: unknown, storeDomain: string): string {
  try {
    const url = new URL(String(value || ''), `https://${storeDomain}`);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function normalizePublicShopifyProduct(
  payload: PublicProduct,
  { currency = 'USD', storeDomain }: { currency?: string; storeDomain: string }
): RuntimeProduct {
  if (!PRODUCT_ID_PATTERN.test(String(payload?.id || ''))) {
    throw new Error('Shopify public product identity is invalid.');
  }
  if (
    !payload?.handle ||
    !payload?.title ||
    !Array.isArray(payload?.variants) ||
    payload.variants.length === 0
  ) {
    throw new Error('Shopify public product facts are incomplete.');
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Shopify public product currency is invalid.');
  }

  const optionNames = Array.isArray(payload.options)
    ? payload.options.map((option) => String(option.name || ''))
    : [];
  const observedVariants = payload.variants.map((variant) => {
    if (!PRODUCT_ID_PATTERN.test(String(variant?.id || ''))) {
      throw new Error('Shopify public variant identity is invalid.');
    }
    const optionValues = [variant.option1, variant.option2, variant.option3];
    return {
      id: `gid://shopify/ProductVariant/${variant.id}`,
      title: String(variant.title || ''),
      availableForSale: variant.available === true,
      price: {
        amount: moneyFromCents(variant.price),
        currencyCode: currency,
      },
      selectedOptions: optionNames
        .map((name, index) => ({
          name,
          value: String(optionValues[index] || ''),
        }))
        .filter((option) => option.name && option.value),
    };
  });
  const tags = Array.isArray(payload.tags) ? payload.tags.map(String) : [];
  const productType = String(payload.type || '');
  const description = plainDescription(payload.description);
  const images = (payload.images || [])
    .map((image) =>
      safeImageUrl(typeof image === 'string' ? image : image?.src, storeDomain)
    )
    .filter(Boolean);
  const colors = [
    ...new Set(
      observedVariants
        .flatMap((variant) => variant.selectedOptions)
        .filter((option) => option.name.toLowerCase() === 'color')
        .map((option) => option.value)
    ),
  ];
  const sizes = [
    ...new Set(
      observedVariants
        .flatMap((variant) => variant.selectedOptions)
        .filter((option) => option.name.toLowerCase() === 'size')
        .map((option) => option.value)
    ),
  ];
  const shopifyId = `gid://shopify/Product/${payload.id}`;

  return {
    id: payload.handle,
    handle: payload.handle,
    shopifyId,
    name: payload.title,
    collection:
      productType.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    price: Number(moneyFromCents(payload.price_min)),
    compareAtPrice: Number(moneyFromCents(payload.price_max)),
    currency,
    tagline: customerTagline(tags, productType),
    description,
    details: description ? [description] : [],
    images,
    media: images.map((url, index) => ({
      id: `${shopifyId}-image-${index}`,
      type: 'image',
      url,
      previewUrl: url,
      alt: payload.title,
    })),
    heroImage: images[0] || '',
    variants: {
      colors: colors.length ? colors : ['Default'],
      sizes: sizes.length ? sizes : ['One Size'],
    },
    observedVariants,
    availableForSale: observedVariants.some(
      (variant) => variant.availableForSale
    ),
    vendor: String(payload.vendor || ''),
    productType,
    tags,
  };
}
