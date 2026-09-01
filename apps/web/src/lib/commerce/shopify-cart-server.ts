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
import storefrontRuntime from '../../../../../config/shopify-storefront-runtime.json';
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
  const storeDomain =
    environment === 'preview'
      ? process.env.SHOPIFY_STAGING_STORE_DOMAIN
      : process.env.SHOPIFY_STORE_DOMAIN || storefrontRuntime.storeDomain;
  const storefrontAccessToken =
    environment === 'preview'
      ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
      : process.env.SHOPIFY_STOREFRONT_TOKEN;
  const checkoutHosts =
    environment === 'preview'
      ? process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS
      : process.env.SHOPIFY_CHECKOUT_HOSTS ||
        storefrontRuntime.checkoutHosts.join(',');
  if (!storeDomain || !storefrontAccessToken) {
    throw new ShopifyCartError('SHOPIFY_CART_NOT_CONFIGURED');
  }
  return { storeDomain, storefrontAccessToken, checkoutHosts };
}

function referenceHash(value: string) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
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
      fetchImpl,
    }),
  };
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
  const result = await client.query<
    { cart?: StorefrontCart | null },
    { id: string }
  >({
    document: GET_CART,
    variables: { id: cartId },
  });
  return result.cart || null;
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
    const result = await client.mutate<
      { cartLinesAdd?: CartMutationPayload },
      { cartId: string; lines: typeof lines }
    >({ document: ADD_CART_LINES, variables: { cartId, lines } });
    if (result.cartLinesAdd?.cart && !result.cartLinesAdd.userErrors?.length) {
      return result.cartLinesAdd.cart;
    }
  }
  const created = await client.mutate<
    { cartCreate?: CartMutationPayload },
    { input: { lines: typeof lines } }
  >({ document: CREATE_CART, variables: { input: { lines } } });
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
