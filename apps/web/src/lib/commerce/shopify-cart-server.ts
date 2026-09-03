import 'server-only';

import {
  ADD_CART_LINES,
  CREATE_CART,
  GET_CART,
  REMOVE_CART_LINES,
  UPDATE_CART_LINES,
  createStorefrontClient,
} from '@repo/shopify';
import type { StorefrontCart } from '@repo/shopify';
import { resolveShopifyStorefrontConfig } from '../config/shopify-environment';
import { createShopifyProductLoader } from '../providers/shopify/product-loader';
import type { CommerceEnvironment } from './runtime-types';
import { createHash } from 'node:crypto';

type CartMutationPayload = {
  cart?: StorefrontCart | null;
  userErrors?: Array<{ message?: string }>;
};

export class ShopifyCartError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'ShopifyCartError';
  }
}

function environmentConfig(environment: CommerceEnvironment) {
  const {
    storeDomain,
    storefrontAccessToken,
    storefrontAccessTokenType,
    checkoutHosts,
  } = resolveShopifyStorefrontConfig(environment);
  if (!storeDomain || !storefrontAccessToken) {
    throw new ShopifyCartError('SHOPIFY_CART_NOT_CONFIGURED');
  }
  return {
    storeDomain,
    storefrontAccessToken,
    storefrontAccessTokenType,
    checkoutHosts,
  };
}

function referenceHash(value: string) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function releaseCartAttributes(environment: CommerceEnvironment) {
  const gitCommitSha =
    process.env.CP_RELEASE_COMMIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    '';
  const release = process.env.CP_RELEASE_ID || '';
  if (environment === 'local') return [];
  if (
    !/^[a-f0-9]{40}$/.test(gitCommitSha) ||
    !/^[A-Za-z0-9._-]+$/.test(release)
  ) {
    throw new ShopifyCartError('CART_RELEASE_BINDING_MISSING');
  }
  return [
    { key: '_cp_release', value: release },
    { key: '_cp_commit_sha', value: gitCommitSha },
    { key: '_cp_commerce_environment', value: environment },
  ];
}

function releaseCartBindingMatches(
  cart: StorefrontCart,
  environment: CommerceEnvironment
) {
  const expected = releaseCartAttributes(environment);
  const actual = new Map(
    (cart.attributes || []).map((attribute) => [attribute.key, attribute.value])
  );
  return expected.every(
    (attribute) => actual.get(attribute.key) === attribute.value
  );
}

function checkedCart(payload: CartMutationPayload | null | undefined) {
  if (!payload?.cart || payload.userErrors?.length) {
    throw new ShopifyCartError('SHOPIFY_CART_MUTATION_REJECTED');
  }
  return payload.cart;
}

function clientFor(environment: CommerceEnvironment, fetchImpl = fetch) {
  const config = environmentConfig(environment);
  return {
    config,
    client: createStorefrontClient({
      storeDomain: config.storeDomain,
      storefrontAccessToken: config.storefrontAccessToken,
      storefrontAccessTokenType: config.storefrontAccessTokenType,
      fetchImpl,
    }),
  };
}

async function requireReleaseBoundCart(
  client: ReturnType<typeof createStorefrontClient>,
  cartId: string,
  environment: CommerceEnvironment
) {
  const result = await client.query<
    { cart?: StorefrontCart | null },
    { id: string }
  >({ document: GET_CART, variables: { id: cartId } });
  if (!result.cart || !releaseCartBindingMatches(result.cart, environment)) {
    throw new ShopifyCartError('CART_RELEASE_BINDING_STALE');
  }
  return result.cart;
}

export async function readShopifyCart({
  cartId,
  environment,
  fetchImpl = fetch,
}: {
  cartId: string | null;
  environment: CommerceEnvironment;
  fetchImpl?: typeof fetch;
}): Promise<StorefrontCart | null> {
  if (!cartId) return null;
  const { client } = clientFor(environment, fetchImpl);
  try {
    return await requireReleaseBoundCart(client, cartId, environment);
  } catch (error) {
    if (
      error instanceof ShopifyCartError &&
      error.code === 'CART_RELEASE_BINDING_STALE'
    ) {
      return null;
    }
    throw error;
  }
}

export async function addShopifyCartLine({
  cartId,
  handle,
  selectionReferenceHash,
  quantity,
  environment,
  fetchImpl = fetch,
}: {
  cartId: string | null;
  handle: string;
  selectionReferenceHash: string;
  quantity: number;
  environment: CommerceEnvironment;
  fetchImpl?: typeof fetch;
}): Promise<StorefrontCart> {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle) ||
    !/^sha256:[a-f0-9]{64}$/.test(selectionReferenceHash) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
  ) {
    throw new ShopifyCartError('INVALID_CART_SELECTION');
  }
  const { client, config } = clientFor(environment, fetchImpl);
  const product = await createShopifyProductLoader({
    storeDomain: config.storeDomain,
    storefrontToken: config.storefrontAccessToken,
    storefrontTokenType: config.storefrontAccessTokenType,
    fetchImpl,
    environment,
    capabilityEvidence: 'shopify-storefront-runtime',
  })(handle);
  const variant = product?.observedVariants?.find(
    (candidate) =>
      candidate.availableForSale &&
      referenceHash(candidate.id) === selectionReferenceHash
  );
  if (!product?.availableForSale || !variant) {
    throw new ShopifyCartError('VARIANT_UNAVAILABLE_OR_STALE');
  }

  const lines = [{ merchandiseId: variant.id, quantity }];
  if (cartId) {
    const existing = await client.query<
      { cart?: StorefrontCart | null },
      { id: string }
    >({ document: GET_CART, variables: { id: cartId } });
    if (
      existing.cart &&
      releaseCartBindingMatches(existing.cart, environment)
    ) {
      const result = await client.mutate<
        { cartLinesAdd?: CartMutationPayload },
        { cartId: string; lines: typeof lines }
      >({ document: ADD_CART_LINES, variables: { cartId, lines } });
      if (
        result.cartLinesAdd?.cart &&
        !result.cartLinesAdd.userErrors?.length
      ) {
        return result.cartLinesAdd.cart;
      }
    }
  }
  const created = await client.mutate<
    { cartCreate?: CartMutationPayload },
    {
      input: {
        lines: typeof lines;
        attributes: Array<{ key: string; value: string }>;
      };
    }
  >({
    document: CREATE_CART,
    variables: {
      input: { lines, attributes: releaseCartAttributes(environment) },
    },
  });
  return checkedCart(created.cartCreate);
}

export async function updateShopifyCartLine({
  cartId,
  lineId,
  quantity,
  environment,
  fetchImpl = fetch,
}: {
  cartId: string;
  lineId: string;
  quantity: number;
  environment: CommerceEnvironment;
  fetchImpl?: typeof fetch;
}) {
  if (
    !cartId ||
    !lineId ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
  ) {
    throw new ShopifyCartError('INVALID_CART_LINE_UPDATE');
  }
  const { client } = clientFor(environment, fetchImpl);
  await requireReleaseBoundCart(client, cartId, environment);
  const result = await client.mutate<
    { cartLinesUpdate?: CartMutationPayload },
    { cartId: string; lines: Array<{ id: string; quantity: number }> }
  >({
    document: UPDATE_CART_LINES,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  return checkedCart(result.cartLinesUpdate);
}

export async function removeShopifyCartLine({
  cartId,
  lineId,
  environment,
  fetchImpl = fetch,
}: {
  cartId: string;
  lineId: string;
  environment: CommerceEnvironment;
  fetchImpl?: typeof fetch;
}) {
  if (!cartId || !lineId)
    throw new ShopifyCartError('INVALID_CART_LINE_REMOVE');
  const { client } = clientFor(environment, fetchImpl);
  await requireReleaseBoundCart(client, cartId, environment);
  const result = await client.mutate<
    { cartLinesRemove?: CartMutationPayload },
    { cartId: string; lineIds: string[] }
  >({
    document: REMOVE_CART_LINES,
    variables: { cartId, lineIds: [lineId] },
  });
  return checkedCart(result.cartLinesRemove);
}

export function trustedCartCheckoutUrl(
  cart: StorefrontCart,
  environment: CommerceEnvironment
) {
  const config = environmentConfig(environment);
  if (!releaseCartBindingMatches(cart, environment)) {
    throw new ShopifyCartError('CART_RELEASE_BINDING_STALE');
  }
  const storeHost = config.storeDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const allowed = new Set([
    storeHost,
    ...(config.checkoutHosts || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  const url = new URL(cart.checkoutUrl);
  if (url.protocol !== 'https:' || !allowed.has(url.hostname)) {
    throw new ShopifyCartError('SHOPIFY_CHECKOUT_URL_REJECTED');
  }
  return url.toString();
}
