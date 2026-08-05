import { evaluateProductReleaseEvidence } from '../releases/product-release-transition.js';
import { filterReleaseBoundMedia } from './media-visibility-policy.js';
import { evaluateObservationVisibility, toReleaseBoundProduct } from './observation-visibility-policy.js';
import { evaluateSingleProductLaunch } from './single-product-launch-policy.js';

const SUPPORTED_ENVIRONMENTS = new Set(['local', 'preview', 'production']);

function deniedShopifyDecision(environment, reason) {
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
}) {
  if (!SUPPORTED_ENVIRONMENTS.has(environment)) {
    throw new Error(`Unsupported commerce environment: ${environment}`);
  }

  if (shopifyProduct) {
    const singleProductLaunch = evaluateSingleProductLaunch({ environment, shopifyProduct });
    if (singleProductLaunch.ready) {
      const product = toReleaseBoundProduct(shopifyProduct, shopifyProduct.observation);
      const media = (Array.isArray(product.media) ? product.media : []).filter(item => {
        try {
          const url = new URL(item?.url || item?.previewUrl || '');
          return url.protocol === 'https:' && url.hostname.endsWith('shopify.com');
        } catch {
          return false;
        }
      }).map((item, index) => ({
        ...item,
        id: `shopify-approved-${index + 1}`,
        label: 'Current Shopify product media',
      }));
      return {
        schemaVersion: 'cp.release-decision.v1',
        environment,
        status: 'available',
        source: 'shopify',
        visibilityAllowed: true,
        commerceAllowed: true,
        reason: singleProductLaunch.reason,
        product: {
          ...product,
          source: 'shopify',
          media,
          images: media.filter(item => item.type === 'image').map(item => item.url),
          heroImage: media.find(item => item.previewUrl)?.previewUrl || media[0]?.url || '',
          mediaReview: {
            status: 'launch-approved-current-shopify-media',
            coveredModalities: ['front'],
            missingModalities: ['back-angle', 'embroidery-detail', 'material-detail', 'on-model', 'lifestyle', 'spin-360', 'model-3d-ar', 'video'],
            missingFallbackCount: 0,
          },
        },
      };
    }
    if (!releaseRecord) {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_RECORD_REQUIRED');
    }
    if (
      releaseRecord.shopify.handle !== shopifyProduct.handle
      || releaseRecord.releaseId !== mediaManifest?.releaseId
    ) {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_EVIDENCE_MISMATCH');
    }
    if (releaseRecord.state === 'withdrawn') {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_WITHDRAWN');
    }
    if (environment === 'preview' && !['staged', 'approved', 'released'].includes(releaseRecord.state)) {
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
      targetState: environment === 'local' ? releaseRecord.state : (
        environment === 'preview' ? 'staged' : 'released'
      ),
    });
    if (!evidenceDecision.ready) {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_EVIDENCE_INCOMPLETE');
    }
    const mediaDecision = filterReleaseBoundMedia({
      product: observationDecision.product,
      manifest: mediaManifest,
    });
    if (environment === 'production' && !mediaDecision.productionReady) {
      return deniedShopifyDecision(environment, 'PRODUCT_RELEASE_MEDIA_BINDING_INCOMPLETE');
    }

    return {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: environment === 'production'
        ? 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED'
        : 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: { ...mediaDecision.product, source: 'shopify' },
    };
  }

  if (environment === 'local' && fixtureProduct) {
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
    reason: shopifyError ? 'SHOPIFY_REQUEST_FAILED' : 'SHOPIFY_PRODUCT_UNAVAILABLE',
    product: null,
  };
}
