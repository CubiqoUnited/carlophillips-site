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
}) {
  if (!SUPPORTED_ENVIRONMENTS.has(environment)) {
    throw new Error(`Unsupported commerce environment: ${environment}`);
  }

  if (shopifyProduct) {
    return {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'SHOPIFY_PRODUCT_OBSERVED_RELEASE_NOT_APPROVED',
      product: { ...shopifyProduct, source: 'shopify' },
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
