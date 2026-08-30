import 'server-only';

export { createStorefrontClient, StorefrontTransportError } from './client';
export { normalizeStorefrontProduct } from './normalize';
export {
  GET_PRODUCT_BY_HANDLE,
  PRODUCT_FRAGMENT,
  STOREFRONT_API_VERSION,
} from './queries';
export {
  createWebhookObservationInput,
  ShopifyWebhookVerificationError,
  verifyShopifyWebhook,
} from './webhooks/verify';

export type {
  StorefrontClientConfig,
  StorefrontFetch,
  StorefrontQueryOptions,
} from './client';
export type {
  StorefrontMediaTransportInput,
  StorefrontProductTransportInput,
  StorefrontVariantTransportInput,
} from './normalize';
export type * from './types';
export type {
  ShopifyWebhookObservationInput,
  ShopifyWebhookVerificationOptions,
  VerifiedShopifyWebhook,
  WebhookIdempotencyStore,
} from './webhooks/verify';

export const SHOPIFY_PACKAGE_AUTHORITY = Object.freeze({
  transport: 'query-only',
  webhooks: 'observation-only',
  mayApproveRelease: false,
  mayApproveMedia: false,
  mayAuthorizeCart: false,
  mayPublish: false,
} as const);
