import {
  createStorefrontClient,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS,
  normalizeStorefrontProduct,
  normalizeStorefrontProducts,
} from '@repo/shopify';
import {
  attachObservationToProduct,
  createProductObservation,
} from '../../commerce/product-observation';
import { createVariantPresentation } from '../../commerce/variant-presentation-policy';
import type {
  GetProductByHandleQuery,
  GetProductsQuery,
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

const SIGNATURE_HOODIE_HANDLE = 'carlophillips-signature-hoodie';
const SIGNATURE_HOODIE_SALE_SIZES = new Set(['S', 'M', 'L']);

export function createShopifyProductLoader({
  storeDomain,
  storefrontToken,
  storefrontTokenType = 'public',
  fetchImpl = fetch,
  environment = 'local',
  observedAt = () => new Date().toISOString(),
  capabilityEvidence = null,
}: {
  storeDomain?: string;
  storefrontToken?: string;
  storefrontTokenType?: 'public' | 'private';
  fetchImpl?: StorefrontFetch;
  environment?: CommerceEnvironment;
  observedAt?: () => string;
  capabilityEvidence?: string | null;
}): ProductLoader {
  if (!storeDomain || !storefrontToken) {
    throw new ShopifyConfigurationError(
      'Shopify Storefront domain is not configured'
    );
  }

  const client = createStorefrontClient({
    storeDomain,
    storefrontAccessToken: storefrontToken,
    storefrontAccessTokenType: storefrontTokenType,
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
    return attachObservationToProduct(
      {
        ...product,
        variantPresentation: createVariantPresentation(observation),
      },
      observation
    );
  };
}

export function createShopifyCatalogLoader({
  storeDomain,
  storefrontToken,
  storefrontTokenType = 'public',
  fetchImpl = fetch,
  environment = 'local',
  observedAt = () => new Date().toISOString(),
  capabilityEvidence = null,
}: {
  storeDomain?: string;
  storefrontToken?: string;
  storefrontTokenType?: 'public' | 'private';
  fetchImpl?: StorefrontFetch;
  environment?: CommerceEnvironment;
  observedAt?: () => string;
  capabilityEvidence?: string | null;
}) {
  if (!storeDomain || !storefrontToken) {
    throw new ShopifyConfigurationError(
      'Shopify Storefront domain and token are required'
    );
  }
  const client = createStorefrontClient({
    storeDomain,
    storefrontAccessToken: storefrontToken,
    storefrontAccessTokenType: storefrontTokenType,
    fetchImpl,
  });
  return async function loadProducts(first = 50): Promise<RuntimeProduct[]> {
    const result = await client.query<GetProductsQuery, { first: number }>({
      document: GET_PRODUCTS,
      variables: { first },
    });
    return normalizeStorefrontProducts(result).map((transport) => {
      const product = toObservedProduct(transport);
      const observation = createProductObservation({
        source: 'shopify',
        environment,
        observedAt: observedAt(),
        product,
        capabilityEvidence,
      });
      return attachObservationToProduct(
        {
          ...product,
          variantPresentation: createVariantPresentation(observation),
        },
        observation
      );
    });
  };
}

export function toObservedProduct(
  product: StorefrontProductTransportInput
): RuntimeProduct {
  const offeredVariants = customerFacingVariants(product);
  const colors = distinctOptions(offeredVariants, 'color');
  const sizes = distinctOptions(offeredVariants, 'size');
  const tagline =
    canonicalCustomerText(product.content.tagline) ||
    canonicalCustomerText(product.productType).toUpperCase();
  const description = canonicalCustomerText(product.description);
  const details = [
    ['Material', product.content.material],
    ['Fit', product.content.fit],
    ['Care', product.content.care],
    ['Size guide', product.content.sizeGuide],
  ]
    .filter(([, value]) => canonicalCustomerText(value))
    .map(([label, value]) => [label, canonicalCustomerText(value)]);

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
    description,
    details,
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
    observedVariants: offeredVariants.map((variant) => ({
      id: variant.rawReference,
      title: variant.title,
      availableForSale: variant.availableForSale,
      price: {
        amount: canonicalMoneyAmount(variant.price.amount),
        currencyCode: variant.price.currency,
      },
      selectedOptions: variant.selectedOptions.map((option) => ({ ...option })),
    })),
    availableForSale: offeredVariants.some(
      (variant) => variant.availableForSale
    ),
    vendor: product.vendor,
    productType: product.productType,
    tags: [...product.tags],
  };
}

function customerFacingVariants(
  product: StorefrontProductTransportInput
): readonly StorefrontVariantTransportInput[] {
  if (product.handle !== SIGNATURE_HOODIE_HANDLE) return product.variants;

  return product.variants.filter((variant) => {
    const size = variant.selectedOptions.find(
      (option) => option.name.toLowerCase() === 'size'
    )?.value;
    return Boolean(size && SIGNATURE_HOODIE_SALE_SIZES.has(size.toUpperCase()));
  });
}

function canonicalCustomerText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function canonicalMoneyAmount(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Shopify variant price is invalid.');
  }
  return amount.toFixed(2);
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
