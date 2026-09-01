import 'server-only';

export { createStorefrontClient, StorefrontTransportError } from './client';
export {
  normalizeStorefrontProduct,
  normalizeStorefrontProducts,
} from './normalize';
export {
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS,
  GET_CART,
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
  CART_FRAGMENT,
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
  StorefrontMutationOptions,
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
  transport: 'storefront-query-and-cart-mutation',
  webhooks: 'observation-only',
  mayApproveRelease: false,
  mayApproveMedia: false,
  mayAuthorizeCart: false,
  mayPublish: false,
} as const);
