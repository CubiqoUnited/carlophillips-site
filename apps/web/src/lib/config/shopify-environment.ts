import 'server-only';

import storefrontRuntime from '../../../../../config/shopify-storefront-runtime.json';
import type { CommerceEnvironment } from '../commerce/runtime-types';

export function resolveShopifyStorefrontConfig(
  environment: CommerceEnvironment
) {
  const preview = environment === 'preview';
  const local = environment === 'local';
  const storeDomain = preview
    ? process.env.SHOPIFY_STAGING_STORE_DOMAIN || ''
    : process.env.SHOPIFY_STORE_DOMAIN ||
      (local ? storefrontRuntime.storeDomain : '');
  const privateStorefrontAccessToken = preview
    ? process.env.SHOPIFY_STAGING_STOREFRONT_PRIVATE_TOKEN
    : undefined;
  const storefrontAccessToken =
    privateStorefrontAccessToken ||
    (preview
      ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
      : process.env.SHOPIFY_STOREFRONT_TOKEN);
  const storefrontAccessTokenType = privateStorefrontAccessToken
    ? ('private' as const)
    : ('public' as const);
  const checkoutHosts = preview
    ? process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS || ''
    : process.env.SHOPIFY_CHECKOUT_HOSTS ||
      (local ? storefrontRuntime.checkoutHosts.join(',') : '');

  return {
    storeDomain,
    storefrontAccessToken,
    storefrontAccessTokenType,
    checkoutHosts,
  };
}

export function resolveShopifyWebhookConfig(environment: CommerceEnvironment) {
  const storefront = resolveShopifyStorefrontConfig(environment);
  const secret =
    environment === 'preview'
      ? process.env.SHOPIFY_STAGING_WEBHOOK_SECRET || ''
      : process.env.SHOPIFY_WEBHOOK_SECRET || '';
  const allowedShops =
    process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS ||
    (environment === 'local' ? storefront.storeDomain : '');

  return { secret, allowedShops };
}
