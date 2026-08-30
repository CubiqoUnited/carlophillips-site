/*
 * AUTO-GENERATED-STYLE STOREFRONT TYPES — DO NOT EDIT BY HAND.
 * Schema pin: Shopify Storefront API 2025-10.
 * Regenerate from the pinned Storefront schema before changing the API version.
 * This deliberately contains transport shapes only; it grants no release,
 * media-approval, cart, checkout, or publication authority.
 */

export type StorefrontApiVersion = '2025-10';

export interface MoneyV2 {
  readonly amount: string;
  readonly currencyCode: string;
}

export interface Image {
  readonly url: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
}

export interface SelectedOption {
  readonly name: string;
  readonly value: string;
}

export interface ProductOption {
  readonly id: string;
  readonly name: string;
  readonly values: readonly string[];
}

export interface ProductVariant {
  readonly id: string;
  readonly title: string;
  readonly availableForSale: boolean;
  readonly price: MoneyV2;
  readonly selectedOptions: readonly SelectedOption[];
  readonly image: Pick<Image, 'url' | 'altText'> | null;
}

export interface MediaSource {
  readonly url: string;
  readonly mimeType: string;
  readonly format: string;
  readonly height?: number | null;
  readonly width?: number | null;
  readonly filesize?: number | null;
}

export interface MediaBase {
  readonly id: string;
  readonly alt: string | null;
  readonly previewImage: Image | null;
}

export interface MediaImage extends MediaBase {
  readonly __typename: 'MediaImage';
  readonly image: Image | null;
}

export interface Video extends MediaBase {
  readonly __typename: 'Video';
  readonly sources: readonly MediaSource[];
}

export interface ExternalVideo extends MediaBase {
  readonly __typename: 'ExternalVideo';
  readonly embeddedUrl: string;
  readonly host: string;
  readonly originUrl: string | null;
}

export interface Model3d extends MediaBase {
  readonly __typename: 'Model3d';
  readonly sources: readonly MediaSource[];
}

export type ProductMedia = MediaImage | Video | ExternalVideo | Model3d;

export interface Edge<TNode> {
  readonly node: TNode;
}

export interface Connection<TNode> {
  readonly edges: readonly Edge<TNode>[];
}

export interface Product {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly description: string;
  readonly descriptionHtml: string;
  readonly productType: string;
  readonly tags: readonly string[];
  readonly vendor: string;
  readonly priceRange: {
    readonly minVariantPrice: MoneyV2;
    readonly maxVariantPrice: MoneyV2;
  };
  readonly images: Connection<Image>;
  readonly media: Connection<ProductMedia>;
  readonly variants: Connection<ProductVariant>;
  readonly options: readonly ProductOption[];
}

export interface GetProductByHandleQueryVariables {
  readonly handle: string;
}

export interface GetProductByHandleQuery {
  readonly product: Product | null;
}

export interface GraphqlError {
  readonly message: string;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export interface GraphqlResponse<TData> {
  readonly data?: TData;
  readonly errors?: readonly GraphqlError[];
}
