import { evaluateProductReleaseEvidence } from '../releases/product-release-transition';
import { filterReleaseBoundMedia } from './media-visibility-policy';
import {
  evaluateObservationVisibility,
  toReleaseBoundProduct,
} from './observation-visibility-policy';
import type {
  CommerceEnvironment,
  MediaManifest,
  ReleaseDecision,
  ReleaseRecord,
  RuntimeProduct,
} from './runtime-types';

const SUPPORTED_ENVIRONMENTS = new Set(['local', 'preview', 'production']);

function deniedShopifyDecision(
  environment: CommerceEnvironment,
  reason: string
): ReleaseDecision {
  return {
    schemaVersion: 'cp.release-decision.v1',
    environment,
    status: 'denied',
    source: 'shopify',
    visibilityAllowed: false,
    commerceAllowed: false,
    reason,
    product: null,
  };
}

/**
 * Resolve a product source without allowing fixtures to hide a Shopify failure.
 * Local fixtures are layout tools only and are never checkout-capable.
 */
export function resolveProductSource({
  environment,
  shopifyProduct = null,
  releaseRecord = null,
  mediaManifest = null,
  fixtureProduct = null,
  shopifyError = null,
}: {
  environment: CommerceEnvironment;
  shopifyProduct?: RuntimeProduct | null;
  releaseRecord?: ReleaseRecord | null;
  mediaManifest?: MediaManifest | null;
  fixtureProduct?: RuntimeProduct | null;
  shopifyError?: unknown;
}): ReleaseDecision {
  if (!SUPPORTED_ENVIRONMENTS.has(environment)) {
    throw new Error(`Unsupported commerce environment: ${environment}`);
  }

  if (shopifyProduct) {
    if (!releaseRecord) {
      return deniedShopifyDecision(
        environment,
        'PRODUCT_RELEASE_RECORD_REQUIRED'
      );
    }
    if (
      releaseRecord.shopify.handle !== shopifyProduct.handle ||
      releaseRecord.releaseId !== mediaManifest?.releaseId
    ) {
      return deniedShopifyDecision(
        environment,
        'PRODUCT_RELEASE_EVIDENCE_MISMATCH'
      );
    }
    if (releaseRecord.state === 'withdrawn') {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_WITHDRAWN');
    }
    if (
      environment === 'preview' &&
      !['staged', 'approved', 'released'].includes(releaseRecord.state)
    ) {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_NOT_STAGED');
    }
    if (environment === 'production' && releaseRecord.state !== 'released') {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_NOT_RELEASED');
    }

    const observationDecision = evaluateObservationVisibility({
      environment,
      shopifyProduct,
      releaseRecord,
    });
    if (!observationDecision.ready) {
      return deniedShopifyDecision(environment, observationDecision.reason);
    }

    const evidenceDecision = evaluateProductReleaseEvidence({
      record: releaseRecord,
      manifest: mediaManifest,
      targetState:
        environment === 'preview'
          ? 'staged'
          : environment === 'production'
            ? 'released'
            : releaseRecord.state,
    });
    if (!evidenceDecision.ready) {
      return deniedShopifyDecision(
        environment,
        'PRODUCT_RELEASE_EVIDENCE_INCOMPLETE'
      );
    }
    const mediaDecision = filterReleaseBoundMedia({
      product: observationDecision.product,
      manifest: mediaManifest as MediaManifest,
    });
    if (environment === 'production' && !mediaDecision.productionReady) {
      return deniedShopifyDecision(
        environment,
        'PRODUCT_RELEASE_MEDIA_BINDING_INCOMPLETE'
      );
    }

    return {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason:
        environment === 'production'
          ? 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED'
          : 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: { ...mediaDecision.product, source: 'shopify' },
    };
  }

  if (fixtureProduct && environment === 'local') {
    return {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'fixture',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'LOCAL_NON_COMMERCE_FIXTURE',
      product: {
        ...fixtureProduct,
        source: 'fixture',
        commerceMode: 'non-commerce',
        allowedEnvironment: 'local',
      },
    };
  }

  return {
    schemaVersion: 'cp.release-decision.v1',
    environment,
    status: 'unavailable',
    source: 'unavailable',
    visibilityAllowed: false,
    commerceAllowed: false,
    reason: shopifyError
      ? 'SHOPIFY_REQUEST_FAILED'
      : 'SHOPIFY_PRODUCT_UNAVAILABLE',
    product: null,
  };
}
