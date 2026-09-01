import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  STOREFRONT_API_VERSION,
  createStorefrontClient,
} from '../packages/shopify/src/index';

describe('Storefront client contract', () => {
  it('pins every request to the chosen stable API and verifies what Shopify executed', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { shop: { name: 'CP' } } }), {
          headers: { 'x-shopify-api-version': STOREFRONT_API_VERSION },
        })
    );
    const client = createStorefrontClient({
      storeDomain: 'example.myshopify.com',
      storefrontAccessToken: 'test-token',
      fetchImpl,
    });

    await expect(
      client.query({ document: 'query Shop { shop { name } }', variables: {} })
    ).resolves.toEqual({ shop: { name: 'CP' } });
    expect(STOREFRONT_API_VERSION).toBe('2026-07');
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://example.myshopify.com/api/2026-07/graphql.json'
    );
  });

  it('fails closed if Shopify silently executes a different API version', async () => {
    const client = createStorefrontClient({
      storeDomain: 'example.myshopify.com',
      storefrontAccessToken: 'test-token',
      fetchImpl: vi.fn(
        async () =>
          new Response(JSON.stringify({ data: { shop: { name: 'CP' } } }), {
            headers: { 'x-shopify-api-version': '2026-04' },
          })
      ),
    });

    await expect(
      client.query({ document: 'query Shop { shop { name } }', variables: {} })
    ).rejects.toMatchObject({
      code: 'SHOPIFY_API_VERSION_MISMATCH',
    });
  });

  it('keeps queries and mutations on separate typed methods', async () => {
    const client = createStorefrontClient({
      storeDomain: 'example.myshopify.com',
      storefrontAccessToken: 'test-token',
      fetchImpl: vi.fn(),
    });
    await expect(
      client.query({
        document: 'mutation Bad { cartCreate { cart { id } } }',
        variables: {},
      })
    ).rejects.toMatchObject({ code: 'SHOPIFY_OPERATION_BOUNDARY' });
    await expect(
      client.mutate({ document: 'query Bad { shop { name } }', variables: {} })
    ).rejects.toMatchObject({ code: 'SHOPIFY_OPERATION_BOUNDARY' });
  });
});
