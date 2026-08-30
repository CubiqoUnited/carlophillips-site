import 'server-only';

import { createHash } from 'node:crypto';
import productOffer from '../../../../../config/shopify-product-offer.json';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../orchestration/capability-registry';
import { createShopifyProductLoader } from '../providers/shopify/product-loader';
import { evaluateProductReleaseEvidence } from '../releases/product-release-transition';
import {
  productOfferAllowsReference,
  type ProductOffer,
} from './product-offer-policy';
import type {
  CapabilityRegistry,
  CommerceEnvironment,
  MediaManifest,
  ProductLoader,
  ReleaseRecord,
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

export interface CheckoutAuthorization {
  status: string;
  owner: string;
  scope: string;
  releaseId: string;
  handle: string;
  environments: string[];
  evidence: string;
}

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

function checkoutAuthorizationReady({
  authorization,
  environment,
  releaseRecord,
}: {
  authorization: CheckoutAuthorization | null;
  environment: CommerceEnvironment;
  releaseRecord: ReleaseRecord;
}): boolean {
  return Boolean(
    authorization?.status === 'approved' &&
    authorization.owner === 'Product Owner' &&
    authorization.scope === 'shopify-hosted-checkout-redirect' &&
    authorization.releaseId === releaseRecord.releaseId &&
    authorization.handle === releaseRecord.shopify.handle &&
    Array.isArray(authorization.environments) &&
    authorization.environments.includes(environment) &&
    typeof authorization.evidence === 'string' &&
    authorization.evidence.trim().length > 0
  );
}

/**
 * Preview revalidates the exact selection and returns a same-origin rehearsal.
 * Production performs the same checks, then creates the Shopify cart and
 * returns only a trusted HTTPS checkout URL. Preview never mutates Shopify.
 */
export async function createApprovedHoodieCheckout({
  handle,
  referenceHash,
  quantity,
  environment,
  releaseRecord = null,
  mediaManifest = null,
  checkoutAuthorization = null,
  storeDomain = process.env.SHOPIFY_STORE_DOMAIN,
  storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN,
  checkoutHosts = process.env.SHOPIFY_CHECKOUT_HOSTS,
  fetchImpl = fetch,
  loadProductImpl = null,
  capabilityRegistry = getCapabilityRegistry(),
  productOfferConfig = productOffer,
}: {
  handle: string;
  referenceHash: string;
  quantity: number;
  environment: CommerceEnvironment;
  releaseRecord?: ReleaseRecord | null;
  mediaManifest?: MediaManifest | null;
  checkoutAuthorization?: CheckoutAuthorization | null;
  storeDomain?: string;
  storefrontToken?: string;
  checkoutHosts?: string;
  fetchImpl?: typeof fetch;
  loadProductImpl?: ProductLoader | null;
  capabilityRegistry?: CapabilityRegistry;
  productOfferConfig?: ProductOffer;
}): Promise<CheckoutResult> {
  if (
    !REFERENCE_PATTERN.test(referenceHash || '') ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 5
  ) {
    return { ok: false, reason: 'INVALID_CHECKOUT_SELECTION' };
  }

  if (
    !releaseRecord ||
    !mediaManifest ||
    releaseRecord.shopify?.handle !== handle ||
    releaseRecord.releaseId !== mediaManifest.releaseId
  ) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_REQUIRED' };
  }

  if (
    !productOfferAllowsReference(productOfferConfig, referenceHash, {
      releaseId: releaseRecord.releaseId,
      handle,
    })
  ) {
    return { ok: false, reason: 'VARIANT_OUTSIDE_APPROVED_OFFER' };
  }

  const requiredState = environment === 'preview' ? 'staged' : 'released';
  const stateReady =
    environment === 'preview'
      ? ['staged', 'approved', 'released'].includes(releaseRecord.state)
      : releaseRecord.state === 'released';
  if (!stateReady) {
    return {
      ok: false,
      reason: `PRODUCT_RELEASE_NOT_${requiredState.toUpperCase()}`,
    };
  }

  const releaseDecision = evaluateProductReleaseEvidence({
    record: releaseRecord,
    manifest: mediaManifest,
    targetState: requiredState,
  });
  if (!releaseDecision.ready) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_INCOMPLETE' };
  }

  if (
    !checkoutAuthorizationReady({
      authorization: checkoutAuthorization,
      environment,
      releaseRecord,
    })
  ) {
    return {
      ok: false,
      reason: 'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION',
    };
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
  if (productRead.status !== 'ready') {
    return { ok: false, reason: 'SHOPIFY_PRODUCT_READ_CAPABILITY_NOT_READY' };
  }
  if (environment === 'production') {
    const cartWrite = discoverCapability(
      capabilityRegistry,
      'shopify-storefront-cart',
      'cart-write'
    );
    if (cartWrite.status !== 'ready') {
      return { ok: false, reason: 'SHOPIFY_CART_CAPABILITY_NOT_READY' };
    }
  }

  const loadProduct =
    loadProductImpl ||
    createShopifyProductLoader({
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
    product.handle !== releaseRecord.shopify.handle ||
    product.observation?.variantFingerprint !==
      releaseRecord.shopify.variantFingerprint ||
    product.observation?.commerceFactsFingerprint !==
      releaseRecord.shopify.commerceFactsFingerprint
  ) {
    return { ok: false, reason: 'SHOPIFY_RELEASE_BINDING_STALE' };
  }

  const variant = product.observedVariants?.find(
    (item) => hashReference(item.id) === referenceHash
  );
  if (!variant?.availableForSale) {
    return { ok: false, reason: 'VARIANT_UNAVAILABLE_OR_STALE' };
  }

  if (environment === 'preview') {
    return {
      ok: true,
      checkoutUrl: '/checkout/confirm?mode=preview',
      mode: 'preview',
    };
  }

  const normalizedDomain = normalizeDomain(storeDomain);
  let response: Response;
  try {
    response = await fetchImpl(
      `https://${normalizedDomain}/api/2024-01/graphql.json`,
      {
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
    checkoutHosts
  );
  return checkoutUrl
    ? { ok: true, checkoutUrl, mode: 'production' }
    : { ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' };
}
