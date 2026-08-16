import 'server-only';

import { createHash } from 'node:crypto';
import { createShopifyProductLoader } from '../providers/shopify/product-loader.js';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry.js';
import { evaluateProductReleaseEvidence } from '../releases/product-release-transition.js';

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

function normalizeDomain(value) {
  return String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function trustedCheckoutUrl(value, storeDomain, checkoutHosts = '') {
  try {
    const url = new URL(value);
    const allowedHosts = new Set([
      normalizeDomain(storeDomain),
      ...String(checkoutHosts).split(',').map(item => normalizeDomain(item.trim())).filter(Boolean),
    ]);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function checkoutAuthorizationReady({ authorization, environment, releaseRecord }) {
  return Boolean(
    authorization?.status === 'approved'
    && authorization.owner === 'Product Owner'
    && authorization.scope === 'shopify-hosted-checkout-redirect'
    && authorization.releaseId === releaseRecord.releaseId
    && authorization.handle === releaseRecord.shopify.handle
    && Array.isArray(authorization.environments)
    && authorization.environments.includes(environment)
    && typeof authorization.evidence === 'string'
    && authorization.evidence.trim().length > 0
  );
}

/**
 * Create a Shopify cart and return its hosted checkout URL only after the
 * canonical release, capability, Product Owner, environment, and current
 * variant checks all pass. Raw Shopify variant IDs remain server-only.
 */
export async function createApprovedHoodieCheckout({
  handle,
  referenceHash,
  quantity,
  environment,
  releaseRecord = null,
  mediaManifest = null,
  checkoutAuthorization = null,
  checkoutRequested = process.env.SHOPIFY_CHECKOUT_ENABLED === 'true',
  storeDomain = process.env.SHOPIFY_STORE_DOMAIN,
  storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN,
  checkoutHosts = process.env.SHOPIFY_CHECKOUT_HOSTS,
  fetchImpl = fetch,
  loadProductImpl = null,
  capabilityRegistry = getCapabilityRegistry(),
}) {
  if (
    !REFERENCE_PATTERN.test(referenceHash || '')
    || !Number.isInteger(quantity)
    || quantity < 1
    || quantity > 5
  ) {
    return { ok: false, reason: 'INVALID_CHECKOUT_SELECTION' };
  }

  if (
    !releaseRecord
    || !mediaManifest
    || releaseRecord.shopify?.handle !== handle
    || releaseRecord.releaseId !== mediaManifest.releaseId
  ) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_REQUIRED' };
  }

  if (releaseRecord.state !== 'released') {
    return { ok: false, reason: 'PRODUCT_RELEASE_NOT_RELEASED' };
  }

  const releaseDecision = evaluateProductReleaseEvidence({
    record: releaseRecord,
    manifest: mediaManifest,
    targetState: 'released',
  });
  if (!releaseDecision.ready) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_INCOMPLETE' };
  }

  if (!checkoutAuthorizationReady({
    authorization: checkoutAuthorization,
    environment,
    releaseRecord,
  })) {
    return { ok: false, reason: 'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION' };
  }
  if (!checkoutRequested) {
    return { ok: false, reason: 'CHECKOUT_ENVIRONMENT_GATE_DISABLED' };
  }
  if (!['preview', 'production'].includes(environment)) {
    return { ok: false, reason: 'CHECKOUT_ENVIRONMENT_REJECTED' };
  }
  if (!storeDomain || !storefrontToken) {
    return { ok: false, reason: 'SHOPIFY_NOT_CONFIGURED' };
  }

  const productRead = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-product-read',
    'product-read'
  );
  const cartWrite = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-cart',
    'cart-write'
  );
  if (productRead.status !== 'ready' || cartWrite.status !== 'ready') {
    return { ok: false, reason: 'SHOPIFY_CART_CAPABILITY_NOT_READY' };
  }

  const loadProduct = loadProductImpl || createShopifyProductLoader({
    storeDomain,
    storefrontToken,
    fetchImpl,
    environment,
    capabilityEvidence: productRead.evidenceRef,
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
  if (
    product.handle !== releaseRecord.shopify.handle
    || product.observation?.variantFingerprint !== releaseRecord.shopify.variantFingerprint
    || product.observation?.commerceFactsFingerprint !== releaseRecord.shopify.commerceFactsFingerprint
  ) {
    return { ok: false, reason: 'SHOPIFY_RELEASE_BINDING_STALE' };
  }

  const variant = product.observedVariants?.find(
    item => hashReference(item.id) === referenceHash
  );
  if (!variant?.availableForSale) {
    return { ok: false, reason: 'VARIANT_UNAVAILABLE_OR_STALE' };
  }

  const normalizedDomain = normalizeDomain(storeDomain);
  let response;
  try {
    response = await fetchImpl(`https://${normalizedDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: CART_CREATE,
        variables: {
          input: { lines: [{ merchandiseId: variant.id, quantity }] },
        },
      }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_REQUEST_FAILED' };
  }
  if (!response.ok) {
    return { ok: false, reason: 'SHOPIFY_CART_HTTP_ERROR' };
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_RESPONSE_INVALID' };
  }
  const result = payload.data?.cartCreate;
  if (
    payload.errors?.length
    || result?.userErrors?.length
    || result?.cart?.totalQuantity !== quantity
  ) {
    return { ok: false, reason: 'SHOPIFY_CART_CREATE_REJECTED' };
  }

  const checkoutUrl = trustedCheckoutUrl(
    result?.cart?.checkoutUrl,
    normalizedDomain,
    checkoutHosts
  );
  return checkoutUrl
    ? { ok: true, checkoutUrl }
    : { ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' };
}
