import { projectShopifyMedia } from './media-visibility-policy';
import type {
  CommerceEnvironment,
  ReleaseDecision,
  RuntimeProduct,
} from './runtime-types';

const SUPPORTED_ENVIRONMENTS = new Set(['local', 'preview', 'production']);

/**
 * Resolve a product source without allowing fixtures to hide a Shopify failure.
 * Local fixtures are layout tools only and are never checkout-capable.
 */
export function resolveProductSource({
  environment,
  shopifyProduct = null,
  fixtureProduct = null,
  shopifyError = null,
}: {
  environment: CommerceEnvironment;
  shopifyProduct?: RuntimeProduct | null;
  fixtureProduct?: RuntimeProduct | null;
  shopifyError?: unknown;
  productionPresentationAuthorization?: unknown;
}): ReleaseDecision {
  if (!SUPPORTED_ENVIRONMENTS.has(environment)) {
    throw new Error(`Unsupported commerce environment: ${environment}`);
  }

  if (shopifyProduct) {
    const mediaDecision = projectShopifyMedia({ product: shopifyProduct });

    return {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: Boolean(shopifyProduct.availableForSale),
      reason: shopifyProduct.availableForSale
        ? 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE'
        : 'CURRENT_SHOPIFY_PRODUCT_SOLD_OUT',
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
