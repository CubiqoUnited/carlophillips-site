import { describe, expect, it } from 'vitest';

import {
  assertRuntimePreflight,
  evaluateRuntimePreflight,
} from '../apps/web/src/lib/config/runtime-preflight';

const previewEnvironment = {
  CP_COMMERCE_ENVIRONMENT: 'preview',
  CP_DURABLE_STORE_ID: 'staging-store',
  CP_EXPECTED_PREVIEW_DURABLE_STORE_ID: 'staging-store',
  SHOPIFY_STAGING_STORE_DOMAIN: 'cp-staging.myshopify.com',
  SHOPIFY_STAGING_STOREFRONT_TOKEN: 'staging-token',
  SHOPIFY_STAGING_CHECKOUT_HOSTS: 'cp-staging.myshopify.com',
  SHOPIFY_STAGING_WEBHOOK_SECRET: 'staging-secret',
  SHOPIFY_WEBHOOK_ALLOWED_SHOPS: 'cp-staging.myshopify.com',
  SHOPIFY_CART_UI_ENABLED: 'true',
  SHOPIFY_CHECKOUT_ENABLED: 'true',
  UPSTASH_REDIS_REST_URL: 'https://staging-redis.example',
  UPSTASH_REDIS_REST_TOKEN: 'redis-token',
};

describe('runtime commerce preflight', () => {
  it('accepts a complete isolated Preview environment', () => {
    expect(evaluateRuntimePreflight('preview', previewEnvironment)).toEqual({
      ok: true,
      environment: 'preview',
    });
  });

  it('accepts a private token instead of a public token in Preview', () => {
    const env = {
      ...previewEnvironment,
      SHOPIFY_STAGING_STOREFRONT_PRIVATE_TOKEN: 'private-token',
    };
    delete env.SHOPIFY_STAGING_STOREFRONT_TOKEN;
    expect(evaluateRuntimePreflight('preview', env)).toEqual({
      ok: true,
      environment: 'preview',
    });
  });

  it('rejects Preview when only Production Shopify names are present', () => {
    const env = {
      ...previewEnvironment,
      SHOPIFY_STORE_DOMAIN: 'cp-production.myshopify.com',
      SHOPIFY_STOREFRONT_TOKEN: 'production-token',
      SHOPIFY_CHECKOUT_HOSTS: 'www.carlophillips.com',
      SHOPIFY_WEBHOOK_SECRET: 'production-secret',
    };
    delete env.SHOPIFY_STAGING_STORE_DOMAIN;
    delete env.SHOPIFY_STAGING_STOREFRONT_TOKEN;
    delete env.SHOPIFY_STAGING_CHECKOUT_HOSTS;
    delete env.SHOPIFY_STAGING_WEBHOOK_SECRET;

    const result = evaluateRuntimePreflight('preview', env);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_STORE_DOMAIN',
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_STOREFRONT_TOKEN',
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_CHECKOUT_HOSTS',
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_WEBHOOK_SECRET',
      ])
    );
  });

  it('rejects shared durable-store identity and mixed allowed shops', () => {
    const result = evaluateRuntimePreflight('preview', {
      ...previewEnvironment,
      CP_DURABLE_STORE_ID: 'production-store',
      SHOPIFY_WEBHOOK_ALLOWED_SHOPS:
        'cp-staging.myshopify.com,cp-production.myshopify.com',
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        'RUNTIME_CONFIG_DURABLE_STORE_ID_MISMATCH',
        'RUNTIME_CONFIG_ALLOWED_SHOP_MISMATCH',
      ])
    );
  });

  it('requires purchasing to stay enabled outside local development', () => {
    expect(() =>
      assertRuntimePreflight('preview', {
        ...previewEnvironment,
        SHOPIFY_CHECKOUT_ENABLED: 'false',
      })
    ).toThrowError('RUNTIME_CONFIG_CHECKOUT_NOT_ENABLED');
  });

  it('does not require external credentials for local fixture work', () => {
    expect(evaluateRuntimePreflight('local', {})).toEqual({
      ok: true,
      environment: 'local',
    });
  });
});
