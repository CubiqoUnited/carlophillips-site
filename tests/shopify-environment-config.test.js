import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  resolveShopifyStorefrontConfig,
  resolveShopifyWebhookConfig,
} from '../apps/web/src/lib/config/shopify-environment';

const previousEnv = { ...process.env };

beforeEach(() => {
  process.env.SHOPIFY_STORE_DOMAIN = 'shared.myshopify.com';
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'shared-token';
  process.env.SHOPIFY_CHECKOUT_HOSTS = 'shared.myshopify.com';
  process.env.SHOPIFY_WEBHOOK_SECRET = 'shared-webhook-secret';
  delete process.env.SHOPIFY_STAGING_STORE_DOMAIN;
  delete process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN;
  delete process.env.SHOPIFY_STAGING_STOREFRONT_PRIVATE_TOKEN;
  delete process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS;
  delete process.env.SHOPIFY_STAGING_WEBHOOK_SECRET;
  delete process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS;
});

afterEach(() => {
  process.env = { ...previousEnv };
});

describe('Shopify environment configuration', () => {
  it('fails closed instead of falling back to Production values in Preview', () => {
    expect(resolveShopifyStorefrontConfig('preview')).toEqual({
      storeDomain: '',
      storefrontAccessToken: undefined,
      storefrontAccessTokenType: 'public',
      checkoutHosts: '',
    });
    expect(resolveShopifyWebhookConfig('preview')).toEqual({
      secret: '',
      allowedShops: '',
    });
  });

  it('prefers explicit staging overrides when isolation is configured', () => {
    process.env.SHOPIFY_STAGING_STORE_DOMAIN = 'staging.myshopify.com';
    process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN = 'staging-token';
    process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS = 'checkout.staging.test';
    process.env.SHOPIFY_STAGING_WEBHOOK_SECRET = 'staging-webhook-secret';
    process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS = 'staging.myshopify.com';

    expect(resolveShopifyStorefrontConfig('preview')).toEqual({
      storeDomain: 'staging.myshopify.com',
      storefrontAccessToken: 'staging-token',
      storefrontAccessTokenType: 'public',
      checkoutHosts: 'checkout.staging.test',
    });
    expect(resolveShopifyWebhookConfig('preview')).toEqual({
      secret: 'staging-webhook-secret',
      allowedShops: 'staging.myshopify.com',
    });
  });

  it('prefers the server-only private token for a locked staging development store', () => {
    process.env.SHOPIFY_STAGING_STORE_DOMAIN = 'staging.myshopify.com';
    process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN = 'public-token';
    process.env.SHOPIFY_STAGING_STOREFRONT_PRIVATE_TOKEN = 'private-token';

    expect(resolveShopifyStorefrontConfig('preview')).toMatchObject({
      storefrontAccessToken: 'private-token',
      storefrontAccessTokenType: 'private',
    });
  });
});
