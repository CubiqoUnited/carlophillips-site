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
  const storefrontAccessToken = preview
    ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
    : process.env.SHOPIFY_STOREFRONT_TOKEN;
  const checkoutHosts = preview
    ? process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS || ''
    : process.env.SHOPIFY_CHECKOUT_HOSTS ||
      (local ? storefrontRuntime.checkoutHosts.join(',') : '');

  return { storeDomain, storefrontAccessToken, checkoutHosts };
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
