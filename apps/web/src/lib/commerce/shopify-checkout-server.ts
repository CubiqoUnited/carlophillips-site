import 'server-only';

import { createHash } from 'node:crypto';
import productionLaunchAuthorization from '../../../../../config/product-owner-production-launch-authorization.json';
import productOffer from '../../../../../config/shopify-product-offer.json';
import storefrontRuntime from '../../../../../config/shopify-storefront-runtime.json';
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

interface ProductionCartProofAuthorization {
  schemaVersion?: string;
  status?: string;
  owner?: string;
  releaseId?: string;
  handle?: string;
  candidateCommit?: string;
  approvedTargetFingerprint?: string;
  environments?: string[];
  scopes?: string[];
  proofReferenceHash?: string;
  proofQuantity?: number;
  evidence?: string;
}

interface ReleaseApprovalEvidenceBinding {
  candidateCommit?: string;
  approvedTargetFingerprint?: string;
}

interface BoundReleaseApproval {
  status?: string;
  owner?: string;
  evidence?: ReleaseApprovalEvidenceBinding | null;
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

function exactProductionCartProofAuthorized({
  authorization,
  environment,
  releaseRecord,
  referenceHash,
  quantity,
}: {
  authorization: ProductionCartProofAuthorization | null;
  environment: CommerceEnvironment;
  releaseRecord: ReleaseRecord;
  referenceHash: string;
  quantity: number;
}): boolean {
  const approvals = [
    releaseRecord.approvals?.product,
    releaseRecord.approvals?.media,
    releaseRecord.approvals?.fulfillment,
  ];
  return Boolean(
    environment === 'production' &&
    ['staged', 'approved'].includes(releaseRecord.state) &&
    authorization?.schemaVersion ===
      'cp.product-owner-production-launch-authorization.v1' &&
    authorization.status === 'approved' &&
    authorization.owner === 'Product Owner' &&
    authorization.releaseId === releaseRecord.releaseId &&
    authorization.handle === releaseRecord.shopify.handle &&
    authorization.candidateCommit === releaseRecord.candidate?.gitCommit &&
    authorization.approvedTargetFingerprint ===
      releaseRecord.candidate?.releaseEvidenceFingerprint &&
    authorization.environments?.includes(environment) &&
    authorization.scopes?.includes('acquire-one-medium-no-order-cart-proof') &&
    authorization.proofReferenceHash === referenceHash &&
    authorization.proofQuantity === quantity &&
    typeof authorization.evidence === 'string' &&
    authorization.evidence.trim().length > 0 &&
    approvals.every((approval) => {
      const boundApproval = approval as BoundReleaseApproval | undefined;
      return (
        boundApproval?.status === 'approved' &&
        boundApproval.owner === 'Product Owner' &&
        boundApproval.evidence?.candidateCommit ===
          releaseRecord.candidate?.gitCommit &&
        boundApproval.evidence?.approvedTargetFingerprint ===
          releaseRecord.candidate?.releaseEvidenceFingerprint
      );
    })
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
  storeDomain = process.env.SHOPIFY_STORE_DOMAIN ||
    storefrontRuntime.storeDomain,
  storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN,
  checkoutHosts = process.env.SHOPIFY_CHECKOUT_HOSTS ||
    storefrontRuntime.checkoutHosts.join(','),
  fetchImpl = fetch,
  loadProductImpl = null,
  capabilityRegistry = getCapabilityRegistry(),
  productOfferConfig = productOffer,
  productionCartProofAuthorization = productionLaunchAuthorization,
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
  productionCartProofAuthorization?: ProductionCartProofAuthorization | null;
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

  const cartProofAuthorized = exactProductionCartProofAuthorized({
    authorization: productionCartProofAuthorization,
    environment,
    releaseRecord,
    referenceHash,
    quantity,
  });
  const requiredState =
    environment === 'preview' || cartProofAuthorized ? 'staged' : 'released';
  const stateReady =
    environment === 'preview' || cartProofAuthorized
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
  if (!storeDomain) {
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
      cartProofAuthorized ? 'cart-write-test' : 'cart-write'
    );
    const cartCapabilityReady = cartProofAuthorized
      ? cartWrite.status === 'evidence_only'
      : cartWrite.status === 'ready';
    if (!cartCapabilityReady) {
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
  if (product.handle !== releaseRecord.shopify.handle) {
    return { ok: false, reason: 'SHOPIFY_RELEASE_HANDLE_STALE' };
  }
  if (
    product.observation?.variantFingerprint !==
    releaseRecord.shopify.variantFingerprint
  ) {
    return { ok: false, reason: 'SHOPIFY_RELEASE_VARIANTS_STALE' };
  }
  if (
    product.observation?.commerceFactsFingerprint !==
    releaseRecord.shopify.commerceFactsFingerprint
  ) {
    return {
      ok: false,
      reason: 'SHOPIFY_RELEASE_COMMERCE_FACTS_STALE',
    };
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
  if (!storefrontToken) {
    const variantId = numericVariantId(variant.id);
    const checkoutUrl = variantId
      ? trustedCheckoutUrl(
          `https://${normalizedDomain}/cart/${variantId}:${quantity}?checkout`,
          normalizedDomain,
          checkoutHosts
        )
      : null;
    return checkoutUrl
      ? { ok: true, checkoutUrl, mode: 'production' }
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
