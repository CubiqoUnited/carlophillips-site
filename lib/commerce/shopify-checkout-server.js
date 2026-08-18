import 'server-only';

import { createHash } from 'node:crypto';
import { createShopifyProductLoader } from '../providers/shopify/product-loader.js';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry.js';
import { evaluateProductReleaseEvidence } from '../releases/product-release-transition.js';
import productOffer from '../../config/shopify-product-offer.json';
import { productOfferAllowsReference } from './product-offer-policy.js';

const REFERENCE_PATTERN = /^sha256:[a-f0-9]{64}$/;
const CART_CREATE = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;
const CONTROLLED_CART_CREATE = `
  mutation CreateControlledCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
        totalQuantity
        cost { subtotalAmount { amount currencyCode } }
      }
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

function controlledOrderAuthorizationReady({ authorization, environment, releaseRecord, now }) {
  const approvedAt = Date.parse(authorization?.approvedAt || '');
  const expiresAt = Date.parse(authorization?.expiresAt || '');
  const currentTime = now.getTime();
  return Boolean(
    authorization?.schemaVersion === 'cp.shopify-controlled-order-authorization.v1'
    && authorization.status === 'approved'
    && authorization.owner === 'Product Owner'
    && authorization.scope === 'prepare-one-medium-shopify-checkout'
    && authorization.releaseId === releaseRecord.releaseId
    && authorization.handle === releaseRecord.shopify.handle
    && authorization.size === 'M'
    && authorization.quantity === 1
    && authorization.maximumItemSubtotal?.amount === '128.00'
    && authorization.maximumItemSubtotal?.currency === 'USD'
    && Array.isArray(authorization.environments)
    && authorization.environments.includes(environment)
    && Number.isFinite(approvedAt)
    && Number.isFinite(expiresAt)
    && approvedAt <= currentTime
    && currentTime <= expiresAt
    && typeof authorization.evidence === 'string'
    && authorization.evidence.trim().length > 0
  );
}

function hasReviewedShopifyAndProviderBinding(releaseRecord) {
  const mappings = releaseRecord?.fulfillmentMappings;
  return Boolean(
    ['staged', 'approved'].includes(releaseRecord?.state)
    && releaseRecord.shopify?.statusObserved === 'ACTIVE'
    && releaseRecord.shopify?.observationFingerprintStatus === 'reviewed'
    && releaseRecord.shopify?.variantFingerprintStatus === 'observed'
    && releaseRecord.shopify?.commerceFactsFingerprintStatus === 'reviewed'
    && releaseRecord.shopify?.observationReviewBinding
    && Array.isArray(mappings)
    && mappings.length === 1
    && mappings[0].adapter === 'apliiq'
    && mappings[0].mappingFingerprintStatus === 'reviewed'
    && mappings[0].mappingFingerprint === releaseRecord.physicalSample?.providerMappingFingerprint
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
  productOfferConfig = productOffer,
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

  if (!productOfferAllowsReference(productOfferConfig, referenceHash, {
    releaseId: releaseRecord.releaseId,
    handle,
  })) {
    return { ok: false, reason: 'VARIANT_OUTSIDE_APPROVED_OFFER' };
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

/**
 * Prepare one Product Owner-controlled Medium checkout through the same
 * Shopify -> Apliiq path used by customer orders. This deliberately does not
 * grant public checkout authority and cannot submit payment or an order.
 */
export async function createControlledMediumCheckout({
  environment,
  releaseRecord = null,
  controlledOrderAuthorization = null,
  controlledOrderRequested = process.env.SHOPIFY_CONTROLLED_ORDER_ENABLED === 'true',
  storeDomain = process.env.SHOPIFY_STORE_DOMAIN,
  storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN,
  checkoutHosts = process.env.SHOPIFY_CHECKOUT_HOSTS,
  fetchImpl = fetch,
  loadProductImpl = null,
  capabilityRegistry = getCapabilityRegistry(),
  productOfferConfig = productOffer,
  now = () => new Date(),
}) {
  if (!releaseRecord || !hasReviewedShopifyAndProviderBinding(releaseRecord)) {
    return { ok: false, reason: 'CONTROLLED_ORDER_RELEASE_BINDING_INCOMPLETE' };
  }
  if (!controlledOrderAuthorizationReady({
    authorization: controlledOrderAuthorization,
    environment,
    releaseRecord,
    now: now(),
  })) {
    return { ok: false, reason: 'CONTROLLED_ORDER_AUTHORIZATION_REQUIRED' };
  }
  if (!controlledOrderRequested) {
    return { ok: false, reason: 'CONTROLLED_ORDER_ENVIRONMENT_GATE_DISABLED' };
  }
  if (!['preview', 'production'].includes(environment)) {
    return { ok: false, reason: 'CONTROLLED_ORDER_ENVIRONMENT_REJECTED' };
  }
  if (!storeDomain || !storefrontToken) {
    return { ok: false, reason: 'SHOPIFY_NOT_CONFIGURED' };
  }

  const productRead = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-product-read',
    'product-read'
  );
  const cartWriteTest = discoverCapability(
    capabilityRegistry,
    'shopify-storefront-cart',
    'cart-write-test'
  );
  if (productRead.status !== 'ready' || cartWriteTest.status !== 'evidence_only') {
    return { ok: false, reason: 'CONTROLLED_ORDER_CART_CAPABILITY_NOT_VERIFIED' };
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
    product = await loadProduct(releaseRecord.shopify.handle);
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

  const variant = product.observedVariants?.find(item => item.selectedOptions?.some(option => (
    option.name?.toLowerCase() === 'size' && option.value?.toLowerCase() === 'm'
  )));
  const referenceHash = variant?.id ? hashReference(variant.id) : '';
  if (
    !variant?.availableForSale
    || !productOfferAllowsReference(productOfferConfig, referenceHash, {
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
    })
    || variant.price?.amount !== controlledOrderAuthorization.maximumItemSubtotal.amount
    || variant.price?.currencyCode !== controlledOrderAuthorization.maximumItemSubtotal.currency
  ) {
    return { ok: false, reason: 'CONTROLLED_MEDIUM_VARIANT_UNAVAILABLE_OR_CHANGED' };
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
        query: CONTROLLED_CART_CREATE,
        variables: {
          input: { lines: [{ merchandiseId: variant.id, quantity: 1 }] },
        },
      }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_REQUEST_FAILED' };
  }
  if (!response.ok) return { ok: false, reason: 'SHOPIFY_CART_HTTP_ERROR' };

  let payload;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: 'SHOPIFY_CART_RESPONSE_INVALID' };
  }
  const result = payload.data?.cartCreate;
  const subtotal = result?.cart?.cost?.subtotalAmount;
  if (
    payload.errors?.length
    || result?.userErrors?.length
    || result?.cart?.totalQuantity !== 1
    || subtotal?.amount !== controlledOrderAuthorization.maximumItemSubtotal.amount
    || subtotal?.currencyCode !== controlledOrderAuthorization.maximumItemSubtotal.currency
  ) {
    return { ok: false, reason: 'CONTROLLED_CART_CREATE_REJECTED' };
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
