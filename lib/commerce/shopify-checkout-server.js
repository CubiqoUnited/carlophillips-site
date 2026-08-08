import 'server-only';

import { createHash } from 'node:crypto';
import { createShopifyProductLoader } from '../providers/shopify/product-loader.js';
import { discoverCapability, getCapabilityRegistry } from '../orchestration/capability-registry.js';
import { evaluateSingleProductLaunch } from './single-product-launch-policy.js';

const REFERENCE_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CART_CREATE = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

function hashReference(value) {
  return `sha256:${createHash('sha256').update(String(value)).digest('hex')}`;
}

function trustedCheckoutUrl(value, storeDomain) {
  try {
    const url = new URL(value);
    const storeHost = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return url.protocol === 'https:' && (
      url.hostname === storeHost
      || url.hostname === 'carlophillips.com'
      || url.hostname === 'www.carlophillips.com'
    ) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function createApprovedHoodieCheckout({
  handle,
  referenceHash,
  quantity,
  storeDomain = process.env.SHOPIFY_STORE_DOMAIN,
  storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN,
  fetchImpl = fetch,
  loadProductImpl = null,
  launchApproval,
}) {
  if (!REFERENCE_PATTERN.test(referenceHash || '') || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
    return { ok: false, reason: 'INVALID_CHECKOUT_SELECTION' };
  }
  if (!storeDomain || !storefrontToken) return { ok: false, reason: 'SHOPIFY_NOT_CONFIGURED' };
  const registry = getCapabilityRegistry();
  const productRead = discoverCapability(registry, 'shopify-storefront-product-read', 'product-read');
  const cartWrite = discoverCapability(registry, 'shopify-storefront-cart', 'cart-write');
  if (productRead.status !== 'ready' || cartWrite.status !== 'ready') {
    return { ok: false, reason: 'SHOPIFY_CAPABILITY_NOT_READY' };
  }

  const loadProduct = loadProductImpl || createShopifyProductLoader({
    storeDomain,
    storefrontToken,
    fetchImpl,
    environment: 'production',
    capabilityEvidence: productRead.evidenceRef,
  });
  let product;
  try {
    product = await loadProduct(handle);
  } catch {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_READ_FAILED' };
  }
  if (!product) return { ok: false, reason: 'SHOPIFY_PRODUCT_UNAVAILABLE' };
  const launch = evaluateSingleProductLaunch({
    environment: 'production',
    shopifyProduct: product,
    ...(launchApproval ? { approval: launchApproval } : {}),
  });
  if (!launch.ready) return { ok: false, reason: launch.reason };

  const variant = product.observedVariants.find(item => hashReference(item.id) === referenceHash);
  if (!variant?.availableForSale) return { ok: false, reason: 'VARIANT_UNAVAILABLE_OR_STALE' };

  const normalizedDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const response = await fetchImpl(`https://${normalizedDomain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query: CART_CREATE, variables: { input: { lines: [{ merchandiseId: variant.id, quantity }] } } }),
    cache: 'no-store',
  });
  if (!response.ok) return { ok: false, reason: 'SHOPIFY_CART_HTTP_ERROR' };
  const payload = await response.json();
  const result = payload.data?.cartCreate;
  if (payload.errors?.length || result?.userErrors?.length || result?.cart?.totalQuantity !== quantity) {
    return { ok: false, reason: 'SHOPIFY_CART_CREATE_REJECTED' };
  }
  const checkoutUrl = trustedCheckoutUrl(result?.cart?.checkoutUrl, normalizedDomain);
  return checkoutUrl ? { ok: true, checkoutUrl } : { ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' };
}
