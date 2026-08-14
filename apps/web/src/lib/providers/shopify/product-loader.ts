import {
  createStorefrontClient,
  GET_PRODUCT_BY_HANDLE,
  normalizeStorefrontProduct,
} from '@repo/shopify';
import {
  attachObservationToProduct,
  createProductObservation,
} from '../../commerce/product-observation';
import type {
  GetProductByHandleQuery,
  StorefrontFetch,
  StorefrontProductTransportInput,
  StorefrontVariantTransportInput,
} from '@repo/shopify';
import type {
  CommerceEnvironment,
  ProductLoader,
  RuntimeProduct,
} from '../../commerce/runtime-types';

class ShopifyConfigurationError extends Error {
  readonly code = 'SHOPIFY_NOT_CONFIGURED';
}

export function createShopifyProductLoader({
  storeDomain,
  storefrontToken,
  fetchImpl = fetch,
  environment = 'local',
  observedAt = () => new Date().toISOString(),
  capabilityEvidence = null,
}: {
  storeDomain?: string;
  storefrontToken?: string;
  fetchImpl?: StorefrontFetch;
  environment?: CommerceEnvironment;
  observedAt?: () => string;
  capabilityEvidence?: string | null;
}): ProductLoader {
  if (!storeDomain || !storefrontToken) {
    throw new ShopifyConfigurationError(
      'Shopify Storefront API is not configured'
    );
  }

  const client = createStorefrontClient({
    storeDomain,
    storefrontAccessToken: storefrontToken,
    fetchImpl,
  });

  return async function loadProduct(handle: string) {
    const result = await client.query<
      GetProductByHandleQuery,
      { handle: string }
    >({
      document: GET_PRODUCT_BY_HANDLE,
      variables: { handle },
    });
    const transport = normalizeStorefrontProduct(result);
    const product = transport ? toObservedProduct(transport) : null;
    if (!product) return null;

    const observation = createProductObservation({
      source: 'shopify',
      environment,
      observedAt: observedAt(),
      product,
      capabilityEvidence,
    });
    return attachObservationToProduct(product, observation);
  };
}

function toObservedProduct(
  product: StorefrontProductTransportInput
): RuntimeProduct {
  const colors = distinctOptions(product.variants, 'color');
  const sizes = distinctOptions(product.variants, 'size');
  const tagline = customerTagline(product.tags, product.productType);

  return {
    id: product.handle,
    handle: product.handle,
    shopifyId: product.rawProductReference,
    name: product.title,
    collection:
      product.productType.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
    price: Number(product.priceRange.minimum.amount),
    compareAtPrice: Number(product.priceRange.maximum.amount),
    currency: product.priceRange.minimum.currency,
    tagline,
    description: product.description,
    details: product.description
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
    images: product.media
      .filter((item) => item.type === 'image')
      .map((item) => item.url),
    media: product.media.map((item) => ({
      id: item.rawReference,
      type: item.type,
      url: item.url,
      previewUrl: item.previewUrl,
      alt: item.alt || product.title,
    })),
    heroImage: product.media.find((item) => item.previewUrl)?.previewUrl || '',
    variants: {
      colors: colors.length ? colors : ['Default'],
      sizes: sizes.length ? sizes : ['One Size'],
    },
    observedVariants: product.variants.map((variant) => ({
      id: variant.rawReference,
      title: variant.title,
      availableForSale: variant.availableForSale,
      price: {
        amount: variant.price.amount,
        currencyCode: variant.price.currency,
      },
      selectedOptions: variant.selectedOptions.map((option) => ({ ...option })),
    })),
    availableForSale: product.variants.some(
      (variant) => variant.availableForSale
    ),
    vendor: product.vendor,
    productType: product.productType,
    tags: [...product.tags],
  };
}

function distinctOptions(
  variants: readonly StorefrontVariantTransportInput[],
  name: string
): string[] {
  return [
    ...new Set(
      variants
        .flatMap((variant) => variant.selectedOptions)
        .filter((option) => option.name.toLowerCase() === name)
        .map((option) => option.value)
    ),
  ];
}

function customerTagline(tags: readonly string[], productType: string): string {
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
