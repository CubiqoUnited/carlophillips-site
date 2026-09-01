import 'server-only';

import type {
  GetProductByHandleQuery,
  GetProductsQuery,
  Image,
  Product,
  ProductMedia,
} from './types';

export interface StorefrontMediaTransportInput {
  readonly rawReference: string;
  readonly type: 'image' | 'video' | 'external_video' | 'model_3d';
  readonly url: string;
  readonly previewUrl: string;
  readonly alt: string;
}

export interface StorefrontVariantTransportInput {
  readonly rawReference: string;
  readonly title: string;
  readonly availableForSale: boolean;
  readonly price: {
    readonly amount: string;
    readonly currency: string;
  };
  readonly selectedOptions: readonly {
    readonly name: string;
    readonly value: string;
  }[];
}

export interface StorefrontProductTransportInput {
  readonly schemaVersion: 'cp.shopify-product-transport-input.v1';
  readonly authority: 'transport-only';
  readonly source: 'shopify-storefront';
  readonly rawProductReference: string;
  readonly handle: string;
  readonly title: string;
  readonly description: string;
  readonly vendor: string;
  readonly productType: string;
  readonly tags: readonly string[];
  readonly content: {
    readonly tagline: string;
    readonly material: string;
    readonly fit: string;
    readonly care: string;
    readonly sizeGuide: string;
  };
  readonly priceRange: {
    readonly minimum: {
      readonly amount: string;
      readonly currency: string;
    };
    readonly maximum: {
      readonly amount: string;
      readonly currency: string;
    };
  };
  readonly media: readonly StorefrontMediaTransportInput[];
  readonly variants: readonly StorefrontVariantTransportInput[];
}

function safeHttpsUrl(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    url.hash = '';
    url.searchParams.sort();
    return url.toString();
  } catch {
    return '';
  }
}

function imageUrl(image: Image | null | undefined): string {
  return safeHttpsUrl(image?.url);
}

function normalizeMedia(
  item: ProductMedia
): StorefrontMediaTransportInput | null {
  const previewUrl = imageUrl(item.previewImage);
  if (item.__typename === 'MediaImage') {
    const url = imageUrl(item.image);
    if (!url) return null;
    return {
      rawReference: item.id,
      type: 'image',
      url,
      previewUrl: previewUrl || url,
      alt: item.alt ?? item.image?.altText ?? '',
    };
  }
  if (item.__typename === 'ExternalVideo') {
    const url = safeHttpsUrl(item.embeddedUrl);
    if (!url) return null;
    return {
      rawReference: item.id,
      type: 'external_video',
      url,
      previewUrl,
      alt: item.alt ?? '',
    };
  }

  const source = item.sources.find((candidate) => {
    const url = safeHttpsUrl(candidate.url);
    return Boolean(url);
  });
  const url = safeHttpsUrl(source?.url);
  if (!url) return null;
  return {
    rawReference: item.id,
    type: item.__typename === 'Video' ? 'video' : 'model_3d',
    url,
    previewUrl,
    alt: item.alt ?? '',
  };
}

export function normalizeStorefrontProduct(
  result: GetProductByHandleQuery
): StorefrontProductTransportInput | null {
  return normalizeProduct(result.product);
}

export function normalizeStorefrontProducts(
  result: GetProductsQuery
): StorefrontProductTransportInput[] {
  return result.products.edges
    .map(({ node }) => normalizeProduct(node))
    .filter(
      (product): product is StorefrontProductTransportInput => product !== null
    );
}

function normalizeProduct(
  product: Product | null
): StorefrontProductTransportInput | null {
  if (!product?.id || !product.handle || !product.title) return null;

  return {
    schemaVersion: 'cp.shopify-product-transport-input.v1',
    authority: 'transport-only',
    source: 'shopify-storefront',
    rawProductReference: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    vendor: product.vendor,
    productType: product.productType,
    tags: [...product.tags],
    content: {
      tagline: product.tagline?.value ?? '',
      material: product.material?.value ?? '',
      fit: product.fit?.value ?? '',
      care: product.care?.value ?? '',
      sizeGuide: product.sizeGuide?.value ?? '',
    },
    priceRange: {
      minimum: {
        amount: product.priceRange.minVariantPrice.amount,
        currency: product.priceRange.minVariantPrice.currencyCode,
      },
      maximum: {
        amount: product.priceRange.maxVariantPrice.amount,
        currency: product.priceRange.maxVariantPrice.currencyCode,
      },
    },
    media: product.media.edges
      .map((edge) => normalizeMedia(edge.node))
      .filter((item): item is StorefrontMediaTransportInput => item !== null),
    variants: product.variants.edges.map(({ node }) => ({
      rawReference: node.id,
      title: node.title,
      availableForSale: node.availableForSale,
      price: {
        amount: node.price.amount,
        currency: node.price.currencyCode,
      },
      selectedOptions: node.selectedOptions.map((option) => ({
        name: option.name,
        value: option.value,
      })),
    })),
  };
}
