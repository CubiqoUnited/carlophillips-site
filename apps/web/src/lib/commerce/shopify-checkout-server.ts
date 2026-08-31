import 'server-only';

import { createHash } from 'node:crypto';
import productOffer from '../../../../../config/shopify-product-offer.json';
import storefrontRuntime from '../../../../../config/shopify-storefront-runtime.json';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import { createShopifyProductLoader } from '../providers/shopify/product-loader';
import type {
  CapabilityRegistry,
  CommerceEnvironment,
  ProductLoader,
} from './runtime-types';

const REFERENCE_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CART_CREATE = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export type CheckoutResult =
  | { ok: true; checkoutUrl: string; mode: 'preview' | 'production' }
  | { ok: false; reason: string };

function hashReference(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function normalizeDomain(value: string | undefined): string {
  return String(value || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}

function numericVariantId(value: string): string | null {
  const match = value.match(/^gid:\/\/shopify\/ProductVariant\/([1-9][0-9]*)$/);
  return match?.[1] || null;
}

function trustedCheckoutUrl(
  value: unknown,
  storeDomain: string,
  checkoutHosts = ''
): string | null {
  try {
    const url = new URL(String(value));
    const allowedHosts = new Set([
      normalizeDomain(storeDomain),
      ...checkoutHosts
        .split(',')
        .map((item) => normalizeDomain(item.trim()))
        .filter(Boolean),
    ]);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Re-read the current Shopify product, resolve the submitted opaque selection
 * to a current available S/M/L variant, create a Shopify cart, and return only
 * a trusted HTTPS Shopify checkout URL. Release records and approval artifacts
 * are intentionally not inputs to public commerce.
 */
export async function createShopifyCheckout({
  handle,
  referenceHash,
  quantity,
  environment,
  storeDomain,
  storefrontToken,
  checkoutHosts,
  fetchImpl = fetch,
  loadProductImpl = null,
  capabilityRegistry = getCapabilityRegistry(),
}: {
  handle: string;
  referenceHash: string;
  quantity: number;
  environment: CommerceEnvironment;
  storeDomain?: string;
  storefrontToken?: string;
  checkoutHosts?: string;
  fetchImpl?: typeof fetch;
  loadProductImpl?: ProductLoader | null;
  capabilityRegistry?: CapabilityRegistry;
}): Promise<CheckoutResult> {
  if (
    handle !== productOffer.handle ||
    !REFERENCE_PATTERN.test(referenceHash || '') ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
  ) {
    return { ok: false, reason: 'INVALID_CHECKOUT_SELECTION' };
  }

  if (!['preview', 'production'].includes(environment)) {
    return { ok: false, reason: 'CHECKOUT_ENVIRONMENT_REJECTED' };
  }
  const checkoutEnvironment =
    environment === 'preview' ? 'preview' : 'production';
  const resolvedStoreDomain =
    storeDomain ||
    (environment === 'preview'
      ? process.env.SHOPIFY_STAGING_STORE_DOMAIN
      : process.env.SHOPIFY_STORE_DOMAIN || storefrontRuntime.storeDomain);
  const resolvedStorefrontToken =
    storefrontToken ||
    (environment === 'preview'
      ? process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN
      : process.env.SHOPIFY_STOREFRONT_TOKEN);
  const resolvedCheckoutHosts =
    checkoutHosts ||
    (environment === 'preview'
      ? process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS
      : process.env.SHOPIFY_CHECKOUT_HOSTS ||
        storefrontRuntime.checkoutHosts.join(','));
  if (!resolvedStoreDomain) {
    return {
      ok: false,
      reason:
        environment === 'preview'
          ? 'SHOPIFY_STAGING_NOT_CONFIGURED'
          : 'SHOPIFY_NOT_CONFIGURED',
    };
  }

  const productRead = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-product-read',
    'product-read'
  );
  if (productRead.status !== 'ready') {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_READ_CAPABILITY_NOT_READY' };
  }
  const cartWrite = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-cart',
    'cart-write-test'
  );
  if (!['ready', 'evidence_only'].includes(cartWrite.status)) {
    return { ok: false, reason: 'SHOPIFY_CART_CAPABILITY_NOT_READY' };
  }

  const loadProduct =
    loadProductImpl ||
    createShopifyProductLoader({
      storeDomain: resolvedStoreDomain,
      storefrontToken: resolvedStorefrontToken,
      fetchImpl,
      environment,
      capabilityEvidence: productRead.evidenceRef,
      publicCurrency: storefrontRuntime.currency,
    });
  let product;
  try {
    product = await loadProduct(handle);
  } catch {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_READ_FAILED' };
  }
  if (!product?.availableForSale) {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_UNAVAILABLE' };
  }
  if (product.handle !== handle) {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_NOT_FOUND' };
  }

  const variant = product.observedVariants?.find(
    (item) => hashReference(item.id) === referenceHash
  );
  const selectedSize = variant?.selectedOptions.find(
    (option) => option.name.toLowerCase() === 'size'
  )?.value;
  if (
    !variant?.availableForSale ||
    !selectedSize ||
    !productOffer.allowedSizes.includes(selectedSize)
  ) {
    return { ok: false, reason: 'VARIANT_UNAVAILABLE_OR_STALE' };
  }

  const normalizedDomain = normalizeDomain(resolvedStoreDomain);
  if (!resolvedStorefrontToken) {
    const variantId = numericVariantId(variant.id);
    const checkoutUrl = variantId
      ? trustedCheckoutUrl(
          `https://${normalizedDomain}/cart/${variantId}:${quantity}?checkout`,
          normalizedDomain,
          resolvedCheckoutHosts
        )
      : null;
    return checkoutUrl
      ? { ok: true, checkoutUrl, mode: checkoutEnvironment }
      : { ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' };
  }

  let response: Response;
  try {
    response = await fetchImpl(
      `https://${normalizedDomain}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': resolvedStorefrontToken,
        },
        body: JSON.stringify({
          query: CART_CREATE,
          variables: {
            input: { lines: [{ merchandiseId: variant.id, quantity }] },
          },
        }),
        cache: 'no-store',
      }
    );
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_REQUEST_FAILED' };
  }
  if (!response.ok) {
    return { ok: false, reason: 'SHOPIFY_CART_HTTP_ERROR' };
  }

  let payload: {
    errors?: unknown[];
    data?: {
      cartCreate?: {
        cart?: { checkoutUrl?: string; totalQuantity?: number };
        userErrors?: unknown[];
      };
    };
  };
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_RESPONSE_INVALID' };
  }
  const result = payload.data?.cartCreate;
  if (
    payload.errors?.length ||
    result?.userErrors?.length ||
    result?.cart?.totalQuantity !== quantity
  ) {
    return { ok: false, reason: 'SHOPIFY_CART_CREATE_REJECTED' };
  }

  const checkoutUrl = trustedCheckoutUrl(
    result?.cart?.checkoutUrl,
    normalizedDomain,
    resolvedCheckoutHosts
  );
  return checkoutUrl
    ? { ok: true, checkoutUrl, mode: checkoutEnvironment }
    : { ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' };
}
